from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

SQLALCHEMY_DATABASE_URL = "sqlite:///./eduforge.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Playlist(Base):
    __tablename__ = "playlists"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True) # Custom playlist cover
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationship to find videos in this playlist
    videos = relationship("VideoLecture", back_populates="playlist")

# --- EXISTING VIDEO TABLE ---
class VideoLecture(Base):
    __tablename__ = "lectures"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String, nullable=True)
    instructor_name = Column(String)
    video_url = Column(String)
    thumbnail_url = Column(String, nullable=True) # New: for custom thumbnails
    script_preview = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # New: Link to Playlist
    playlist_id = Column(Integer, ForeignKey("playlists.id"), nullable=True)
    playlist = relationship("Playlist", back_populates="videos")

# --- NEW USER TABLE ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String) # "instructor" or "student"

Base.metadata.create_all(bind=engine)