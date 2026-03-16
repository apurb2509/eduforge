import edge_tts
import asyncio

class TTSService:
    def __init__(self):
        # We'll use a clear, professional English voice
        self.voice = "en-US-GuyNeural"
        
    async def generate_speech(self, text, output_path):
        communicate = edge_tts.Communicate(text, self.voice)
        await communicate.save(output_path)
        return output_path