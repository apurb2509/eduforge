from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate-video")
async def generate_video(
    text: str = Form(...),
    image: UploadFile = File(...)
):
    # For now, we just acknowledge receipt
    return {
        "status": "received",
        "filename": image.filename,
        "text_length": len(text)
    }

@app.get("/")
def read_root():
    return {"message": "EduForge Backend API is running"}