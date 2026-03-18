import sys
import os

# 1. Path Injection
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from os import listdir, path
import numpy as np
import scipy, cv2, argparse, audio
import json, subprocess, random, string
from tqdm import tqdm
from glob import glob
import torch, face_detection
from models import Wav2Lip
import platform

mel_step_size = 16
device = 'cuda' if torch.cuda.is_available() else 'cpu'

def get_smoothened_boxes(boxes, T):
    for i in range(len(boxes)):
        if i + T > len(boxes):
            window = boxes[len(boxes) - T:]
        else:
            window = boxes[i : i + T]
        boxes[i] = np.mean(window, axis=0)
    return boxes

def face_detect(images, args):
    # Initialize detector only once to save VRAM
    detector = face_detection.FaceAlignment(face_detection.LandmarksType._2D, 
                                            flip_input=False, device=device)
    batch_size = args.face_det_batch_size
    
    while 1:
        predictions = []
        try:
            for i in tqdm(range(0, len(images), batch_size), desc="Detecting Faces"):
                predictions.extend(detector.get_detections_for_batch(np.array(images[i:i + batch_size])))
        except RuntimeError:
            if batch_size == 1: 
                raise RuntimeError('Image too big for face detection. Use --resize_factor')
            batch_size //= 2
            continue
        break

    results = []
    pady1, pady2, padx1, padx2 = args.pads
    for rect, image in zip(predictions, images):
        if rect is None:
            raise ValueError('Face not detected! Check your input image.')
        y1 = max(0, rect[1] - pady1)
        y2 = min(image.shape[0], rect[3] + pady2)
        x1 = max(0, rect[0] - padx1)
        x2 = min(image.shape[1], rect[2] + padx2)
        results.append([x1, y1, x2, y2])

    boxes = np.array(results)
    if not args.nosmooth: boxes = get_smoothened_boxes(boxes, T=5)
    return [[image[y1: y2, x1:x2], (y1, y2, x1, x2)] for image, (x1, y1, x2, y2) in zip(images, boxes)]

def datagen(frames, mels, args):
    img_batch, mel_batch, frame_batch, coords_batch = [], [], [], []

    # OPTIMIZATION: If it's a static image, only detect face ONCE.
    if args.box[0] == -1:
        if args.static:
            print("Static image detected. Running face detection only once...")
            face_det_results = face_detect([frames[0]], args)
        else:
            face_det_results = face_detect(frames, args)
    else:
        y1, y2, x1, x2 = args.box
        face_det_results = [[f[y1: y2, x1:x2], (y1, y2, x1, x2)] for f in frames]

    for i, m in enumerate(mels):
        idx = 0 if args.static else i % len(frames)
        frame_to_save = frames[idx].copy()
        
        # Use existing detection result for static or specific frame for video
        res_idx = 0 if args.static else idx
        face, coords = face_det_results[res_idx].copy()
        
        face = cv2.resize(face, (args.img_size, args.img_size))
        
        img_batch.append(face)
        mel_batch.append(m)
        frame_batch.append(frame_to_save)
        coords_batch.append(coords)

        if len(img_batch) >= args.wav2lip_batch_size:
            img_batch, mel_batch = np.asarray(img_batch), np.asarray(mel_batch)
            img_masked = img_batch.copy()
            img_masked[:, args.img_size//2:] = 0
            img_batch = np.concatenate((img_masked, img_batch), axis=3) / 255.
            mel_batch = np.reshape(mel_batch, [len(mel_batch), mel_batch.shape[1], mel_batch.shape[2], 1])
            yield img_batch, mel_batch, frame_batch, coords_batch
            img_batch, mel_batch, frame_batch, coords_batch = [], [], [], []

    if len(img_batch) > 0:
        img_batch, mel_batch = np.asarray(img_batch), np.asarray(mel_batch)
        img_masked = img_batch.copy()
        img_masked[:, args.img_size//2:] = 0
        img_batch = np.concatenate((img_masked, img_batch), axis=3) / 255.
        mel_batch = np.reshape(mel_batch, [len(mel_batch), mel_batch.shape[1], mel_batch.shape[2], 1])
        yield img_batch, mel_batch, frame_batch, coords_batch

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--checkpoint_path', type=str, required=True)
    parser.add_argument('--face', type=str, required=True)
    parser.add_argument('--audio', type=str, required=True)
    parser.add_argument('--outfile', type=str, default='temp/result.mp4')
    parser.add_argument('--static', type=bool, default=False)
    parser.add_argument('--fps', type=float, default=25.)
    parser.add_argument('--pads', nargs='+', type=int, default=[0, 10, 0, 0])
    
    # Defaults adjusted for low-resource environments
    parser.add_argument('--face_det_batch_size', type=int, default=4)
    parser.add_argument('--wav2lip_batch_size', type=int, default=8) 
    parser.add_argument('--resize_factor', default=2, type=int) 
    
    parser.add_argument('--crop', nargs='+', type=int, default=[0, -1, 0, -1])
    parser.add_argument('--box', nargs='+', type=int, default=[-1, -1, -1, -1])
    parser.add_argument('--rotate', default=False, action='store_true')
    parser.add_argument('--nosmooth', default=False, action='store_true')

    args = parser.parse_args()
    args.img_size = 96

    if os.path.isfile(args.face) and any(args.face.lower().endswith(ext) for ext in ['.jpg', '.png', '.jpeg']):
        args.static = True

    # 1. Load Frames
    full_frames = []
    if args.static:
        img = cv2.imread(args.face)
        if args.resize_factor > 1:
            img = cv2.resize(img, (img.shape[1]//args.resize_factor, img.shape[0]//args.resize_factor))
        full_frames.append(img)
    else:
        video_stream = cv2.VideoCapture(args.face)
        fps = video_stream.get(cv2.CAP_PROP_FPS)
        while 1:
            still_reading, frame = video_stream.read()
            if not still_reading: break
            if args.resize_factor > 1:
                frame = cv2.resize(frame, (frame.shape[1]//args.resize_factor, frame.shape[0]//args.resize_factor))
            full_frames.append(frame)
        video_stream.release()

    # 2. Process Audio
    if not args.audio.endswith('.wav'):
        subprocess.call(f'ffmpeg -y -i "{args.audio}" -ar 16000 "temp/temp.wav"', shell=True)
        args.audio = 'temp/temp.wav'

    wav = audio.load_wav(args.audio, 16000)
    mel = audio.melspectrogram(wav)

    # 3. Create Mel Chunks
    mel_chunks = []
    mel_idx_multiplier = 80./args.fps 
    i = 0
    while 1:
        start_idx = int(i * mel_idx_multiplier)
        if start_idx + mel_step_size > len(mel[0]):
            mel_chunks.append(mel[:, len(mel[0]) - mel_step_size:])
            break
        mel_chunks.append(mel[:, start_idx : start_idx + mel_step_size])
        i += 1

    # 4. Run Inference
    model = Wav2Lip()
    checkpoint = torch.load(args.checkpoint_path, map_location='cpu' if device=='cpu' else None, weights_only=False)
    
    if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
        s = checkpoint["state_dict"]
        new_s = {k.replace('module.', ''): v for k, v in s.items()}
        model.load_state_dict(new_s)
    elif isinstance(checkpoint, dict):
        new_s = {k.replace('module.', ''): v for k, v in checkpoint.items()}
        model.load_state_dict(new_s)
    else:
        try:
            model.load_state_dict(checkpoint.state_dict())
        except:
            model = checkpoint 

    model = model.to(device).eval()

    # 5. GENERATION LOOP
    gen = datagen(full_frames, mel_chunks, args)
    frame_h, frame_w = full_frames[0].shape[:-1]
    out = cv2.VideoWriter('temp/result.avi', cv2.VideoWriter_fourcc(*'DIVX'), args.fps, (frame_w, frame_h))

    for img_batch, mel_batch, frames, coords in tqdm(gen, total=int(np.ceil(float(len(mel_chunks))/args.wav2lip_batch_size)), desc="Syncing Lips"):
        img_batch = torch.FloatTensor(np.transpose(img_batch, (0, 3, 1, 2))).to(device)
        mel_batch = torch.FloatTensor(np.transpose(mel_batch, (0, 3, 1, 2))).to(device)

        with torch.no_grad():
            pred = model(mel_batch, img_batch)

        pred = pred.cpu().numpy().transpose(0, 2, 3, 1) * 255.
        for p, f, c in zip(pred, frames, coords):
            y1, y2, x1, x2 = c
            p = cv2.resize(p.astype(np.uint8), (x2 - x1, y2 - y1))
            f[y1:y2, x1:x2] = p
            out.write(f)

    out.release()
    # Final merge with Audio
    subprocess.call(f'ffmpeg -y -i "{args.audio}" -i temp/result.avi -strict -2 -q:v 1 "{args.outfile}"', shell=True)

if __name__ == "__main__":
    main()