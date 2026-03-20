# 🎓 EduForge: AI-Powered Autonomous Learning Platform

EduForge is a cutting-edge, full-stack educational ecosystem designed to bridge the gap between static text and immersive video learning. By leveraging Generative AI (Edge-TTS) and Automated Media Engines (FFmpeg), EduForge allows instructors to transform raw scripts into fully produced video lectures with synchronized audio and visual assets.

---

## 🏗️ System Architecture & Current Progress

The platform is currently in **Phase 2 (Functional Prototype)**. All core authentication, role-based navigation, and media management systems are fully operational.

---

## 🟢 Completed Milestones

* [x] **Secure Auth Engine**: JWT-based persistent sessions with Bcrypt password hashing.
* [x] **Dual-Interface UX**: Specialized dashboards for Instructors (Content Creation) and Students (Content Consumption).
* [x] **AI Audio Pipeline**: Integration with Edge-TTS for high-fidelity natural speech synthesis.
* [x] **Media Assembly Engine**: FFmpeg integration for automated video/audio muxing and thumbnail generation.
* [x] **Archive Management**: Full CRUD capabilities for lectures and a custom Playlist Orchestrator.
* [x] **Responsive Navigation**: Real-time tab switching between Video and Playlist views.

---

## 🟡 In-Progress (Roadmap)

* [ ] **Wav2Lip / SadTalker**: Implementing neural lip-sync for AI talking heads.
* [ ] **Vector Search (RAG)**: Enabling students to query lecture content via AI.
* [ ] **Progress Analytics**: Visual tracking of student watch-time and completion rates.

---

## 🛠️ Tech Stack

| Layer      | Technology                                         |
| ---------- | -------------------------------------------------- |
| Frontend   | React 18 (Vite), Tailwind CSS, Lucide Icons, Axios |
| Backend    | FastAPI (Python 3.10+), Uvicorn                    |
| Database   | SQLite with SQLAlchemy ORM                         |
| AI / Media | Edge-TTS, FFmpeg, Python-Multipart                 |
| Security   | JWT (JSON Web Tokens), Passlib (Bcrypt)            |

---

## 🚀 Installation & Rapid Deployment

Follow these steps to replicate the development environment.

### 1. Repository Initialization

```bash
git clone https://github.com/YOUR_USERNAME/eduforge.git
cd eduforge
```

### 2. Backend Environment Setup

Open a terminal in the `/backend` directory:

```bash
# Create and activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/macOS
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Environment Setup

Open a second terminal in the `/frontend` directory:

```bash
npm install
```

---

## 💻 Execution Commands

To run the application locally, ensure you have two terminal instances active.

### Terminal 1: FastAPI Backend

Navigate to the backend folder and run:

```bash
# Standard Reload Mode
python -m uvicorn main:app --reload --port 8000
```

### Terminal 2: Vite Frontend

Navigate to the frontend folder and run:

```bash
npm run dev
```

---

## 📂 Professional Project Structure

```plaintext
eduforge/
├── backend/
│   ├── main.py            # FastAPI Entry Point
│   ├── database.py        # SQLAlchemy Config
│   ├── models.py          # SQL User & Media Schemas
│   ├── schemas.py         # Pydantic Validation
│   ├── utils/             # TTS & FFmpeg Logic
│   └── static/            # Generated AI Video/Image Assets
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI (Navbar, Modals)
│   │   ├── pages/         # Dashboard, Archive, Gallery
│   │   └── App.jsx        # Routing Logic
│   └── tailwind.config.js # Custom Design Tokens
└── requirements.txt       # Backend Dependencies
```
