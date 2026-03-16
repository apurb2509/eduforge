import os
import time

def clear_old_files(directory, seconds=3600):
    current_time = time.time()
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        if os.path.getmtime(file_path) < current_time - seconds:
            os.remove(file_path)