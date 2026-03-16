import os
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from services.tts_service import TTSService

app = FastAPI()
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

@app.get("/")
def read_root():
    return {"message": "EduForge Backend API is running"}