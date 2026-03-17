import subprocess
import os

class VideoService:
    # RENAMED to create_static_video to match main.py's expectation
    def create_static_video(self, image_path, audio_path, output_path):
        command = [
            'ffmpeg', '-y',
            '-loop', '1', '-i', image_path,
            '-i', audio_path,
            '-vf', (
                "scale=trunc(iw/2)*2:trunc(ih/2)*2," 
                "zoompan=z='min(zoom+0.0005,1.1)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'," 
                "format=yuv420p"
            ),
            '-c:v', 'libx264',
            '-tune', 'stillimage',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-shortest',
            output_path
        ]
        
        try:
            subprocess.run(command, check=True, capture_output=True, text=True)
            return output_path
        except subprocess.CalledProcessError as e:
            print(f"FFmpeg Error: {e.stderr}")
            raise e