import subprocess
import os

class VideoService:
    def create_dynamic_video(self, image_path, audio_path, output_path):
        """
        Generates a video where the image has a subtle dynamic zoom/movement 
        to mimic a 'talking head' effect while the audio plays.
        """
        # We use a complex filter to add a subtle 'zoompan' and 'shake' 
        # to make the static person look more 'alive' during the lecture.
        command = [
            'ffmpeg', '-y',
            '-loop', '1', '-i', image_path,
            '-i', audio_path,
            '-vf', (
                "scale=trunc(iw/2)*2:trunc(ih/2)*2," # Ensure even dimensions
                "zoompan=z='min(zoom+0.0005,1.1)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'," # Subtle zoom
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