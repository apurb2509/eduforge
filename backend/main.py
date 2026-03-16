import os
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Import Services
from services.tts_service import TTSService
from services.video_service import VideoService
from services.notes_service import NotesService
from utils.cleanup import clear_old_files

app = FastAPI()
tts = TTSService()
video_service = VideoService()
notes_service = NotesService()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = "temp"
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

# Mount static files BEFORE routes
app.mount("/static", StaticFiles(directory=TEMP_DIR), name="static")

@app.post("/generate-video")
async def generate_video(
    text: str = Form(...),
    image: UploadFile = File(...)
):
    # 1. Cleanup old files
    clear_old_files(TEMP_DIR)

    # 2. Save the uploaded image
    image_path = os.path.join(TEMP_DIR, image.filename)
    with open(image_path, "wb") as buffer:
        buffer.write(await image.read())
    
    # 3. Generate Audio from Text
    audio_path = os.path.join(TEMP_DIR, "lecture_audio.mp3")
    await tts.generate_speech(text, audio_path)

    # 4. Create Video
    video_path = os.path.join(TEMP_DIR, "output_lecture.mp4")
    video_service.create_static_video(image_path, audio_path, video_path)
    
    return {
        "status": "completed",
        "video_url": "http://127.0.0.1:8000/static/output_lecture.mp4"
    }

@app.post("/generate-notes")
async def generate_notes(text: str = Form(...)):
    notes = notes_service.generate_notes(text)
    return notes

@app.get("/")
def read_root():
    return {"message": "EduForge Backend API is running"}