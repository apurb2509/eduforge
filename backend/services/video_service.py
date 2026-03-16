import subprocess
import os

class VideoService:
    def create_static_video(self, image_path, audio_path, output_path):
        # The filter "pad=ceil(iw/2)*2:ceil(ih/2)*2" ensures width/height are even
        command = [
            'ffmpeg', '-y',
            '-loop', '1', '-i', image_path,
            '-i', audio_path,
            '-vf', "scale='trunc(iw/2)*2':'trunc(ih/2)*2',format=yuv420p",
            '-c:v', 'libx264', '-tune', 'stillimage',
            '-c:a', 'aac', '-b:a', '192k',
            '-shortest',
            output_path
        ]
        
        try:
            # Capture output so we can see errors in the console if it fails again
            result = subprocess.run(command, check=True, capture_output=True, text=True)
            return output_path
        except subprocess.CalledProcessError as e:
            print(f"FFmpeg STDOUT: {e.stdout}")
            print(f"FFmpeg STDERR: {e.stderr}")
            raise e