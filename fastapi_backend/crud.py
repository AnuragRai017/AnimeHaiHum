from sqlalchemy.orm import Session
from .models import Video

def create_video(db: Session, video_data):
    video = Video(**video_data)
    db.add(video)
    db.commit()
    db.refresh(video)
    return video

def update_video(db: Session, video_id: int, video_data):
    video = db.query(Video).filter(Video.id == video_id).first()
    if video:
        for key, value in video_data.items():
            setattr(video, key, value)
        db.commit()
        db.refresh(video)
    return video
