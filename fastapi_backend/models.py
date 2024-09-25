# models.py

from sqlalchemy import Column, Date
from sqlalchemy import Column, Float, ForeignKey, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base
from sqlalchemy.orm import relationship

# Video model definition
class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    video_file_url = Column(String)
    thumbnail_url = Column(String, nullable=True)  # Allow it to be nullable
    upload_time = Column(DateTime)
    duration = Column(Integer)  # Ensure the 'duration' field is here as an integer
    video_type = Column(String)  # Example: anime, webseries, etc.
    season = Column(Integer, nullable=True)
    episode = Column(Integer, nullable=True)
    is_processed = Column(Boolean, default=False)
    views_count = Column(Integer, default=0)

    ratings = relationship("VideoRatings", back_populates="video")
    watch_history = relationship("UserWatchHistory", back_populates="video")


# models.py (Django models or FastAPI SQLAlchemy models)

class UserWatchHistory(Base):
    __tablename__ = "user_watch_history"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))  # Assuming you're using Django's User model
    video_id = Column(Integer, ForeignKey('videos.id'))
    last_watched_time = Column(DateTime, server_default=func.now())
    last_position = Column(Float)  # Timestamp of the last viewed position in seconds

    user = relationship("User", back_populates="watch_history")
    video = relationship("Video", back_populates="watch_history")


# User model for FastAPI
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)  # Store hashed passwords
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    role = Column(String, default="user")

    # One-to-many relationship with watch history
    watch_history = relationship("UserWatchHistory", back_populates="user")
    profile = relationship("UserProfile", back_populates="user", uselist=False)

class VideoViews(Base):
    __tablename__ = "video_views"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"))
    views_count = Column(Integer, default=0)


class WatchHistory(Base):
    __tablename__ = "watch_history"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))  # Assuming auth_user is from Django
    video_id = Column(Integer, ForeignKey('videos.id'))
    last_watched_time = Column(DateTime, server_default=func.now())
    last_position = Column(Float)  # Timestamp of the last viewed position in seconds

    user = relationship("User")
    video = relationship("Video")
    
# New VideoRatings model
class VideoRatings(Base):
    __tablename__ = "video_ratings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))  # Reference to the User model
    video_id = Column(Integer, ForeignKey("videos.id"))  # Reference to the Video model
    rating = Column(Float, nullable=False)  # The rating value (1-5 stars)
    rated_at = Column(DateTime, server_default=func.now())  # When the rating was submitted

    user = relationship("User")  # Assuming a relationship with the User table (Django)
    video = relationship("Video", back_populates="ratings")  # Link back to Video model
    
    

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    profile_pic = Column(String, nullable=True)  # URL or path to the profile picture
    username = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    dob = Column(Date, nullable=True)  # Date of birth

    # Define relationship with User
    user = relationship("User", back_populates="profile")

    

