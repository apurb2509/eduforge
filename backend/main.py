import os
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
    clear_old_files(TEMP_DIR)

    image_path = os.path.join(TEMP_DIR, image.filename)
    with open(image_path, "wb") as buffer:
        buffer.write(await image.read())
    
    audio_path = os.path.join(TEMP_DIR, "lecture_audio.mp3")
    await tts.generate_speech(text, audio_path)

    video_path = os.path.join(TEMP_DIR, "output_lecture.mp4")
    
    # Try AI LipSync
    success = lipsync.run_sync(image_path, audio_path, video_path)
    
    # Fallback to Static/Zoom Video if AI fails
    if not success:
        video_service.create_static_video(image_path, audio_path, video_path)

    return {
        "status": "completed",
        "video_url": "http://127.0.0.1:8000/static/output_lecture.mp4",
        "method": "AI LipSync" if success else "Static Fallback"
    }

@app.post("/generate-notes")
async def generate_notes(text: str = Form(...)):
    return notes_service.generate_notes(text)

@app.get("/")
def read_root():
    return {"message": "EduForge Backend API is running"}