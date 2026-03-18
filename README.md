<!-- ## AI Components Status
- [x] Text-to-Speech: Edge-TTS (Active)
- [ ] Talking Head: Wav2Lip/SadTalker (In Progress)
- [x] Media Engine: FFmpeg (Active)

Commands for running the servers: 
Backend: (.venv) PS G:\Projects\eduforge\backend> .\venv\Scripts\python.exe -m uvicorn main:app --reload
(.venv) PS G:\Projects\eduforge\backend> python -m uvicorn main:app --reload
Frontend: npm run dev -->

# 🎓 EduForge: AI-Powered Learning Platform

EduForge is a full-stack educational platform that empowers instructors to transform static knowledge into engaging, AI-generated video lectures. Built with a modern tech stack, it features role-based access control, secure authentication, and a dynamic student gallery.

---

## 🚀 Key Features

* **AI Video Generation**: Instructors can generate scripts and video content using integrated AI workflows.
* **Role-Based Access (RBAC)**: Secure separation between **Instructor** (Content Creators) and **Student** (Learners) dashboards.
* **Secure Authentication**: Password hashing using `Bcrypt` and persistent sessions via `JWT/LocalStorage`.
* **Dynamic Gallery**: A responsive student portal to browse, search, and playback AI-generated lectures.
* **Automated Workflow**: From script generation to video output, stored and served via a FastAPI backend.

---

## 🛠️ Tech Stack

### Frontend

* **Framework**: React.js (Vite)
* **Routing**: React Router Dom v6
* **Styling**: Tailwind CSS & Lucide Icons
* **API Client**: Axios

### Backend

* **Framework**: FastAPI (Python)
* **Database**: SQLite (SQLAlchemy ORM)
* **Security**: Passlib with Bcrypt (4.0.1)
* **Media**: Static file serving for AI-generated `.mp4` outputs

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/eduforge.git
cd eduforge
```

### 2. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or .venv\\Scripts\\activate on Windows
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Project Structure

* `/backend`: FastAPI logic, SQLite database (eduforge.db), and AI output storage.
* `/frontend`: React components, protected routes, and Tailwind styling.
* `/outputs`: Directory for generated AI video and image assets.

---

## 🛡️ Roadmap

* [x] Secure Authentication & Role Toggle
* [x] Protected Routing for Instructors/Students
* [x] Dynamic Video Gallery & Playback
* [ ] Automated Email Notifications for new lectures
* [ ] Student Progress Tracking
* [ ] Wav2Lip Integration for AI Lip-Synced Video Generation

---

## 👨‍💻 Author

Developed by **Apurb**
3rd Year Electronics & Instrumentation Engineering
NIT Rourkela

---

## 🚀 Deployment Notes

Make sure to configure environment variables and production-ready settings before deploying. Consider using platforms like Vercel (frontend) and Render/ Railway (backend) for seamless hosting.
