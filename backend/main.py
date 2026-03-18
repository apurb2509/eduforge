import os
import time
import uuid
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel

# Import your services
from services.tts_service import TTSService
from services.video_service import VideoService
from services.notes_service import NotesService
from services.lipsync_service import LipSyncService
from utils.cleanup import clear_old_files

# Database Imports
from database import SessionLocal, VideoLecture, engine, Base

# Initialize Database Tables on Startup
Base.metadata.create_all(bind=engine)

app = FastAPI()
tts = TTSService()
video_service = VideoService()
notes_service = NotesService()
lipsync = LipSyncService()

# --- Pydantic Models for Type Safety ---
class UserAuth(BaseModel):
    email: str
    password: str
    full_name: str = None
    role: str = "student"

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
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = "temp"
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

app.mount("/static", StaticFiles(directory=TEMP_DIR), name="static")

# --- GENERATE VIDEO ENDPOINT ---
@app.post("/generate-video")
async def generate_video(
    text: str = Form(...), 
    image: UploadFile = File(...), 
    title: str = Form("Untitled Lecture"),
    instructor_name: str = Form("Instructor"),
    db: Session = Depends(get_db)
):
    # 1. Cleanup old files
    clear_old_files(TEMP_DIR)
    
    # 2. Setup Unique Paths
    timestamp = int(time.time())
    unique_id = uuid.uuid4().hex[:6]
    image_filename = f"input_{timestamp}_{unique_id}.jpg"
    image_path = os.path.join(TEMP_DIR, image_filename)
    audio_path = os.path.join(TEMP_DIR, f"audio_{timestamp}_{unique_id}.mp3")
    video_filename = f"output_{timestamp}_{unique_id}.mp4"
    video_path = os.path.join(TEMP_DIR, video_filename)

    # Save uploaded image
    content = await image.read()
    with open(image_path, "wb") as buffer:
        buffer.write(content)
    
    # Generate speech
    await tts.generate_speech(text, audio_path)
    
    # 3. AI LipSync (Fallback to static if it fails)
    success = lipsync.run_sync(image_path, audio_path, video_path)
    if not success:
        video_service.create_static_video(image_path, audio_path, video_path)

    # 4. Save to Database
    new_lecture = VideoLecture(
        title=title,
        instructor_name=instructor_name,
        video_url=video_filename,
        script_preview=text[:100]
    )
    db.add(new_lecture)
    db.commit()
    db.refresh(new_lecture)

    return {
        "status": "completed",
        "video_url": f"http://127.0.0.1:8000/static/{video_filename}",
        "lecture_id": new_lecture.id,
        "method": "AI LipSync" if success else "Static Fallback"
    }

# --- STUDENT GALLERY ENDPOINT ---
@app.get("/student/lectures")
async def get_all_lectures(db: Session = Depends(get_db)):
    lectures = db.query(VideoLecture).order_by(VideoLecture.created_at.desc()).all()
    return [
        {
            "id": l.id,
            "title": l.title,
            "instructor": l.instructor_name,
            "video_url": f"http://127.0.0.1:8000/static/{l.video_url}",
            "preview": l.script_preview,
            "date": l.created_at.strftime("%Y-%m-%d")
        } for l in lectures
    ]

@app.post("/generate-notes")
async def generate_notes(text: str = Form(...)):
    return notes_service.generate_notes(text)

# --- AUTH LOGIC (Corrected with UserAuth model) ---
users_db = {} 

@app.post("/auth/register")
async def register(user: UserAuth):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    users_db[user.email] = user.dict()
    return {"message": f"User registered as {user.role}"}

@app.post("/auth/login")
async def login(user_data: UserAuth):
    user = users_db.get(user_data.email)
    if not user or user["password"] != user_data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {"status": "success", "name": user["full_name"], "role": user["role"]}

@app.get("/")
def read_root():
    return {"message": "EduForge Backend API is running smoothly"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)