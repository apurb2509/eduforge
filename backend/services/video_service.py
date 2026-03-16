import subprocess
import os

class VideoService:
    def create_static_video(self, image_path, audio_path, output_path):
        # -shortest: ends the video when the shortest input (audio) ends
        # -vf "fade...": adds a professional 0.5s fade out at the end
        command = [
            'ffmpeg', '-y',
            '-loop', '1', '-i', image_path,
            '-i', audio_path,
            '-c:v', 'libx264', 
            '-tune', 'stillimage',
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac', '-b:a', '192k',
            '-shortest',
            output_path
        ]
        
        try:
            subprocess.run(command, check=True, capture_output=True)
            return output_path
        except subprocess.CalledProcessError as e:
            print(f"FFmpeg Error: {e.stderr.decode()}")
            raise e