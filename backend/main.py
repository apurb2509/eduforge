import os
import time
import shutil
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from services.tts_service import TTSService
from services.video_service import VideoService
from services.notes_service import NotesService
from services.lipsync_service import LipSyncService
from utils.cleanup import clear_old_files

app = FastAPI()
tts = TTSService()
video_service = VideoService()
notes_service = NotesService()
lipsync = LipSyncService()

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

@app.post("/generate-video")
async def generate_video(text: str = Form(...), image: UploadFile = File(...)):
    # 1. Clear OLD files to prevent storage bloat
    clear_old_files(TEMP_DIR)
    
    # 2. Create a unique timestamp for this specific request
    # This prevents Windows "File Locking" errors and browser caching issues
    timestamp = int(time.time())
    
    # Define unique paths
    image_path = os.path.join(TEMP_DIR, f"input_{timestamp}_{image.filename}")
    audio_path = os.path.join(TEMP_DIR, f"audio_{timestamp}.mp3")
    video_filename = f"output_{timestamp}.mp4"
    video_path = os.path.join(TEMP_DIR, video_filename)

    # Save uploaded image
    with open(image_path, "wb") as buffer:
        buffer.write(await image.read())
    
    # Generate speech
    await tts.generate_speech(text, audio_path)
    
    # 3. Try AI LipSync
    success = lipsync.run_sync(image_path, audio_path, video_path)
    
    # Fallback to Static/Zoom Video if AI fails
    if not success:
        video_service.create_static_video(image_path, audio_path, video_path)

    # 4. Return the unique URL
    return {
        "status": "completed",
        "video_url": f"http://127.0.0.1:8000/static/{video_filename}",
        "method": "AI LipSync" if success else "Static Fallback"
    }

@app.post("/generate-notes")
async def generate_notes(text: str = Form(...)):
    return notes_service.generate_notes(text)

from utils.security import get_password_hash, verify_password, create_access_token
from models.user import UserCreate, UserRole

# For demo purposes, we'll use an in-memory "database"
# Replace this with MongoDB/PostgreSQL later
users_db = {}

@app.post("/auth/register")
async def register(user: UserCreate):
    if user.email in users_db:
        return {"error": "Email already registered"}
    
    hashed_password = get_password_hash(user.password)
    users_db[user.email] = {
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "hashed_password": hashed_password
    }
    return {"message": f"User registered as {user.role}"}

@app.post("/auth/login")
async def login(form_data: UserCreate): # Simplified for now
    user = users_db.get(form_data.email)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        return {"error": "Invalid credentials"}
    
    access_token = create_access_token(data={"sub": user["email"], "role": user["role"]})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "role": user["role"],
        "name": user["full_name"]
    }

@app.get("/")
def read_root():
    return {"message": "EduForge Backend API is running"}

if __name__ == "__main__":
    import uvicorn
    # This matches the settings you were using in the command line
    uvicorn.run("main:app", host="127.0.0.1", port=8000, log_level="info")