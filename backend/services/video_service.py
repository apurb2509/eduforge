import subprocess
import os

class VideoService:
    def create_static_video(self, image_path, audio_path, output_path):
        # This command loops the image to match the audio duration
        command = [
            'ffmpeg', '-y',
            '-loop', '1', '-i', image_path,
            '-i', audio_path,
            '-c:v', 'libx264', '-tune', 'stillimage',
            '-c:a', 'aac', '-b:a', '192k',
            '-pix_fmt', 'yuv420p', '-shortest',
            output_path
        ]
        subprocess.run(command, check=True)
        return output_path