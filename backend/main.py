import os
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from services.tts_service import TTSService

app = FastAPI()
app.mount("/static", StaticFiles(directory="temp"), name="static")
tts = TTSService()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = "temp"

@app.post("/generate-video")
async def generate_video(
    text: str = Form(...),
    image: UploadFile = File(...)
):
    # 1. Save the uploaded image
    image_path = os.path.join(TEMP_DIR, image.filename)
    with open(image_path, "wb") as buffer:
        buffer.write(await image.read())
    
    # 2. Generate Audio from Text
    audio_path = os.path.join(TEMP_DIR, "lecture_audio.mp3")
    await tts.generate_speech(text, audio_path)
    
    return {
        "status": "audio_generated",
        "image_path": image_path,
        "audio_path": audio_path,
        "message": "Speech synthesis complete. Ready for video processing."
    }

from services.video_service import VideoService

video_service = VideoService()

@app.post("/generate-video")
async def generate_video(text: str = Form(...), image: UploadFile = File(...)):
    # ... existing image saving and tts code ...
    
    # 3. Create Video
    video_path = os.path.join(TEMP_DIR, "output_lecture.mp4")
    video_service.create_static_video(image_path, audio_path, video_path)
    
    return {
        "status": "completed",
        "video_url": "http://127.0.0.1:8000/static/output_lecture.mp4"
    }

@app.get("/")
def read_root():
    return {"message": "EduForge Backend API is running"}