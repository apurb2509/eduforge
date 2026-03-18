## AI Components Status
- [x] Text-to-Speech: Edge-TTS (Active)
- [ ] Talking Head: Wav2Lip/SadTalker (In Progress)
- [x] Media Engine: FFmpeg (Active)

Commands for running the servers: 
Backend: (.venv) PS G:\Projects\eduforge\backend> .\venv\Scripts\python.exe -m uvicorn main:app --reload
(.venv) PS G:\Projects\eduforge\backend> python -m uvicorn main:app --reload
Frontend: npm run dev