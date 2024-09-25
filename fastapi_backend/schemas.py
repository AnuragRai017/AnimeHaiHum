# schemas.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Request schema for video creation
class VideoCreate(BaseModel):
    title: str
    description: str
    video_file_url: str  # Add this line
    thumbnail_url: Optional[str]
    upload_time: datetime
    duration: int
    video_type: str
    season: Optional[int]
    episode: Optional[int]
    is_processed: Optional[bool]

class VideoResponse(BaseModel):
    id: int
    title: str
    description: str
    video_file_url: str
    thumbnail_url: Optional[str]  # Allow this to be optional
    upload_time: str
    duration: Optional[int] = 0  # Make duration optional, default to 0 if None
    video_type: Optional[str] = "unknown"  # Make video_type optional, default to 'unknown'
    season: Optional[int]
    episode: Optional[int]
    is_processed: bool
    views_count: int

    class Config:
        orm_mode = True

# Pydantic model for rating submission
class RatingCreate(BaseModel):
    video_id: int
    rating: float  # Rating should be between 1 and 5

# Pydantic model for returning rating data
# Response schema for ratings
class RatingResponse(BaseModel):
    user_id: int
    video_id: int
    rating: float
    rated_at: datetime

    class Config:
        orm_mode = True
        
# Schema for signup request
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

# Schema for user response
class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        orm_mode = True