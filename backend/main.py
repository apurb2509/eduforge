import os
import time
import uuid
import asyncio
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload # Add this import at the top
from pydantic import BaseModel
from passlib.context import CryptContext

# Import your services
from services.tts_service import TTSService
from services.video_service import VideoService
from services.notes_service import NotesService
from services.lipsync_service import LipSyncService
from utils.cleanup import clear_old_files

# Database Imports - Import all models directly from database.py
from database import SessionLocal, User, VideoLecture, Playlist, engine, Base

# Initialize Database Tables on Startup
Base.metadata.create_all(bind=engine)

app = FastAPI()
tts = TTSService()
video_service = VideoService()
notes_service = NotesService()
lipsync = LipSyncService()

# --- WebSocket Connection Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_progress(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                continue

    # --- ADD THIS METHOD ---
    async def broadcast_refresh(self):
        """Sends a signal to all clients to refresh their data"""
        for connection in self.active_connections:
            try:
                await connection.send_json({"type": "REFRESH_DATA"})
            except:
                continue

manager = ConnectionManager()

# --- Pydantic Models ---
class UserAuth(BaseModel):
    email: str
    password: str
    full_name: str = None
    role: str = "student"

class LectureUpdate(BaseModel):
    title: str
    description: str
    playlist_id: int = None # Allow moving video to a playlist

class PlaylistCreate(BaseModel):
    name: str
    description: str = ""
    video_ids: list[int] = []

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = "temp"
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

# Add this line to get the absolute path of your project folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) 

# Update the mount line
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, TEMP_DIR)), name="static")

# --- WebSocket Endpoint ---
@app.websocket("/ws/progress")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- GENERATE VIDEO ENDPOINT (With Real-Time Progress) ---
@app.post("/generate-video")
async def generate_video(
    text: str = Form(...), 
    image: UploadFile = File(...), 
    title: str = Form("Untitled Lecture"),
    description: str = Form(""), # Added description field
    instructor_name: str = Form("Instructor"),
    db: Session = Depends(get_db)
):
    # 1. Start Progress
    await manager.broadcast_progress({"progress": 5, "status": "Cleaning old files..."})
    # clear_old_files(TEMP_DIR)
    
    # 2. Setup Paths
    timestamp = int(time.time())
    unique_id = uuid.uuid4().hex[:6]
    image_filename = f"input_{timestamp}_{unique_id}.jpg"
    image_path = os.path.join(TEMP_DIR, image_filename)
    audio_path = os.path.join(TEMP_DIR, f"audio_{timestamp}_{unique_id}.mp3")
    video_filename = f"output_{timestamp}_{unique_id}.mp4"
    video_path = os.path.join(TEMP_DIR, video_filename)

    # 3. Save Image
    await manager.broadcast_progress({"progress": 15, "status": "Processing Image..."})
    content = await image.read()
    with open(image_path, "wb") as buffer:
        buffer.write(content)
    
    # 4. Generate Speech
    await manager.broadcast_progress({"progress": 30, "status": "Generating Speech..."})
    await tts.generate_speech(text, audio_path)
    
    # 5. AI LipSync
    await manager.broadcast_progress({"progress": 50, "status": "Syncing Lips (AI Processing)..."})
    
    # Simulation for UI smoothness
    await asyncio.sleep(0.5) 
    
    success = lipsync.run_sync(image_path, audio_path, video_path)
    
    await manager.broadcast_progress({"progress": 85, "status": "Finalizing Video..."})
    if not success:
        video_service.create_static_video(image_path, audio_path, video_path)

    # 6. Save to Database (Permanent Record)
    new_lecture = VideoLecture(
        title=title,
        description=description, # Saving description to DB
        instructor_name=instructor_name,
        video_url=video_filename,
        script_preview=text[:100]
    )
    db.add(new_lecture)
    db.commit()
    db.refresh(new_lecture)

    # 7. Complete Progress
    await manager.broadcast_progress({"progress": 100, "status": "Completed!"})
    await manager.broadcast_refresh()

    return {
        "status": "completed",
        "video_url": f"http://127.0.0.1:8000/static/{video_filename}",
        "lecture_id": new_lecture.id
    }

# --- UNIFIED LECTURES ENDPOINT ---
@app.get("/lectures")
@app.get("/student/lectures")
async def get_all_lectures(db: Session = Depends(get_db)):
    lectures = db.query(VideoLecture).order_by(VideoLecture.created_at.desc()).all()
    return [
        {
            "id": l.id,
            "title": l.title,
            "description": l.description or "No description provided.",
            "instructor": l.instructor_name,
            "video_url": l.video_url, 
            "preview": l.script_preview,
            "date": l.created_at.strftime("%Y-%m-%d") if l.created_at else "Recent"
        } for l in lectures
    ]

@app.patch("/lectures/{lecture_id}")
async def update_lecture(
    lecture_id: int, 
    title: str = Form(...),
    description: str = Form(...),
    playlist_id: int = Form(None),
    thumbnail: UploadFile = File(None), # Optional new thumbnail
    db: Session = Depends(get_db)
):
    lecture = db.query(VideoLecture).filter(VideoLecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    lecture.title = title
    lecture.description = description
    lecture.playlist_id = playlist_id if playlist_id != 0 else None

    if thumbnail:
        # Save the new custom thumbnail
        ts = int(time.time())
        thumb_filename = f"thumb_{ts}_{lecture_id}.jpg"
        thumb_path = os.path.join(TEMP_DIR, thumb_filename)
        content = await thumbnail.read()
        with open(thumb_path, "wb") as f:
            f.write(content)
        lecture.thumbnail_url = thumb_filename

    db.commit()
    await manager.broadcast_refresh()
    return {"message": "Updated successfully"}

# --- DELETE LECTURE ENDPOINT (For Archive Management) ---
@app.delete("/lectures/{lecture_id}")
async def delete_lecture(lecture_id: int, db: Session = Depends(get_db)):
    lecture = db.query(VideoLecture).filter(VideoLecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    db.delete(lecture)
    db.commit()
    return {"message": "Lecture deleted successfully"}

# --- AUTH LOGIC ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password[:72])

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

@app.post("/auth/register")
async def register(user_data: UserAuth, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created", "user_id": new_user.id}

@app.post("/auth/login")
async def login(user_data: UserAuth, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {
        "status": "success",
        "user": {
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        }
    }

@app.post("/playlists")
async def create_playlist(data: PlaylistCreate, db: Session = Depends(get_db)):
    # 1. Create the Playlist object
    new_p = Playlist(name=data.name, description=data.description)
    db.add(new_p)
    db.flush() # Get the ID before committing
    
    # 2. Update the lectures to point to this new playlist
    if data.video_ids:
        db.query(VideoLecture).filter(VideoLecture.id.in_(data.video_ids)).update(
            {"playlist_id": new_p.id}, 
            synchronize_session=False
        )
    
    # 3. Commit EVERYTHING to the database
    db.commit()
    db.refresh(new_p)
    
    # 4. NOW broadcast to students (after DB is 100% updated)
    await manager.broadcast_refresh() 
    
    return new_p

@app.post("/playlists/{playlist_id}/add-video")
async def add_video_to_playlist_alt(
    playlist_id: int, 
    video_id: int = Form(...), # Expecting video_id as form data
    db: Session = Depends(get_db)
):
    lecture = db.query(VideoLecture).filter(VideoLecture.id == video_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Video not found")
    
    lecture.playlist_id = playlist_id
    db.commit()
    await manager.broadcast_refresh()
    return {"message": "Video added to playlist"}

@app.get("/playlists")
async def get_playlists(db: Session = Depends(get_db)):
    # Use joinedload to explicitly include the 'videos' relationship in the result
    playlists = db.query(Playlist).options(joinedload(Playlist.videos)).all()
    return playlists

@app.delete("/playlists/{playlist_id}")
async def delete_playlist(playlist_id: int, db: Session = Depends(get_db)):
    p = db.query(Playlist).filter(Playlist.id == playlist_id).first()
    if p:
        db.query(VideoLecture).filter(VideoLecture.playlist_id == playlist_id).update({"playlist_id": None})
        db.delete(p)
        db.commit()
        # --- ADD THIS LINE ---
        await manager.broadcast_refresh()
    return {"message": "Playlist removed"}

# --- UNLINK VIDEO FROM PLAYLIST ---
@app.post("/lectures/{lecture_id}/unlink")
async def unlink_video(lecture_id: int, db: Session = Depends(get_db)):
    lecture = db.query(VideoLecture).filter(VideoLecture.id == lecture_id).first()
    if not lecture:
        raise HTTPException(status_code=404, detail="Lecture not found")
    
    lecture.playlist_id = None
    db.commit()
    # --- ADD THIS LINE ---
    await manager.broadcast_refresh()
    return {"message": "Video unlinked from playlist"}

# Ensure your get_playlists still uses joinedload as discussed:
@app.get("/playlists")
async def get_playlists(db: Session = Depends(get_db)):
    return db.query(Playlist).options(joinedload(Playlist.videos)).all()

@app.get("/")
def read_root():
    return {"message": "EduForge API Active"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)