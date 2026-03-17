import os
import subprocess
import sys

class LipSyncService:
    def __init__(self):
        # Changed from .pt to .pth to match your file
        self.checkpoint = "models/checkpoints/Wav2Lip-SD-GAN.pth"
        self.python_exe = sys.executable

    def run_sync(self, face_image, audio_track, output_path):
        if not os.path.exists(self.checkpoint):
            print(f"Error: Checkpoint not found at {os.path.abspath(self.checkpoint)}")
            return False

        # Get absolute paths to avoid confusion when we change CWD
        abs_checkpoint = os.path.abspath(self.checkpoint)
        abs_face = os.path.abspath(face_image)
        abs_audio = os.path.abspath(audio_track)
        abs_output = os.path.abspath(output_path)
        
        # We run the command FROM the wav2lip folder
        # This solves the "No module named audio" error permanently
        command = [
            self.python_exe, "inference.py",
            "--checkpoint_path", abs_checkpoint,
            "--face", abs_face,
            "--audio", abs_audio,
            "--outfile", abs_output,
            "--nosmooth"
        ]

        try:
            print("AI is animating the face... this may take a minute.")
            # Use cwd="backend/wav2lip" to force the context
            # If you are already in 'backend', use cwd="wav2lip"
            result = subprocess.run(
                command, 
                check=True, 
                capture_output=True, 
                text=True, 
                cwd="wav2lip"
            )
            print("LipSync completed successfully!")
            return True
        except subprocess.CalledProcessError as e:
            print(f"Inference Failed Error: {e.stderr}")
            return False
        except Exception as e:
            print(f"Unexpected Error: {e}")
            return False