# main.py

from datetime import datetime, timedelta
import shutil
from typing import List
from fastapi import FastAPI, Form, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError
import jwt
from fastapi import status
from sqlalchemy import func, text
from sqlalchemy.orm import Session
from database import SessionLocal, get_db
from celery_tasks import process_video
from auth_utils import (
       ACCESS_TOKEN_EXPIRE_MINUTES,
       ALGORITHM,
       SECRET_KEY,
       create_access_token,
       get_current_user,
       get_password_hash,
       user_only,
       verify_password,
       admin_only,
   )
from models import User, UserWatchHistory, Video, VideoRatings, UserProfile  # Add this import
from schemas import RatingResponse, VideoCreate, VideoResponse
import os
from schemas import RatingCreate, RatingResponse
from models import WatchHistory
from models import VideoViews,VideoRatings
from fastapi.security import OAuth2PasswordBearer
from schemas import UserCreate, UserResponse
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sync_api import sync_to_django

app = FastAPI()

app.mount("/uploaded_videos", StaticFiles(directory="uploaded_videos"), name="uploaded_videos")
app.mount("/posters", StaticFiles(directory="posters"), name="posters")



# Directory for storing uploaded videos
UPLOAD_DIR = "./uploaded_videos/"
POSTER_DIR = "./posters/"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(POSTER_DIR, exist_ok=True)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Dependency to get the DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost", "http://127.0.0.1:3000"],   # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Signup API
@app.post("/signup/", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, email=user.email, hashed_password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@app.post("/login/")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Verify password using bcrypt
    if not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # If login is successful, generate JWT token
    access_token = create_access_token(data={"sub": user.username})

    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/secure-route/")
def secure_route(current_user: User = Depends(get_current_user)):
    return {"message": f"Hello {current_user.username}, you are authenticated!"}


@app.post("/upload/", dependencies=[Depends(admin_only)])
async def upload_video(
    file: UploadFile = File(...),
    poster: UploadFile = File(None),
    title: str = Form(...),
    description: str = Form(...),
    upload_date: datetime = Form(datetime.now()),
    duration: int = Form(...),
    video_type: str = Form(...),
    file_extension: str = Form(None),
    season: int = Form(None),
    episode: int = Form(None),
    db: Session = Depends(get_db)
):
    # Determine file extension
    if file_extension is None:
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else None
    
    # Save video file
    file_location = f"{UPLOAD_DIR}{file.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(await file.read())

    # Handle poster upload
    poster_url = None
    if poster:
        poster_dir = "posters"
        os.makedirs(poster_dir, exist_ok=True)  # Ensure posters directory exists
        poster_path = f"{poster_dir}/{poster.filename}"
        with open(poster_path, "wb") as poster_object:
            poster_object.write(await poster.read())
        poster_url = poster_path  # Save the relative path

    # Save video metadata to the database
    new_video = Video(
        title=title,
        description=description,
        video_file_url=file_location,
        thumbnail_url=poster_url,  # Store poster URL in the database
        upload_time=upload_date,
        duration=duration,
        video_type=video_type,
        season=season if video_type in ['anime', 'webseries'] else None,
        episode=episode if video_type in ['anime', 'webseries'] else None,
        is_processed=False
    )
    db.add(new_video)
    db.commit()
    db.refresh(new_video)

    # Create a directory for the HLS output
    hls_output_dir = f"{UPLOAD_DIR}/{new_video.id}_hls/"
    os.makedirs(hls_output_dir, exist_ok=True)

    # Trigger FFmpeg video processing asynchronously
    process_video.delay(new_video.id, file_location, hls_output_dir)

    return {"message": "Video uploaded successfully and is being processed."}



@app.post("/videos/{video_id}/watch", dependencies=[Depends(admin_only)])
async def track_watch(video_id: int, user_id: int, position: int, db: Session = Depends(get_db)):
    # Increment views count
    video_views = db.query(VideoViews).filter(VideoViews.video_id == video_id).first()
    if not video_views:
        video_views = VideoViews(video_id=video_id, views_count=1)
    else:
        video_views.views_count += 1
    db.add(video_views)
    db.commit()

    # Update user's watch history
    watch_history = db.query(UserWatchHistory).filter_by(user_id=user_id, video_id=video_id).first()
    if not watch_history:
        watch_history = UserWatchHistory(user_id=user_id, video_id=video_id, last_position=position)
    else:
        watch_history.last_position = position
    db.add(watch_history)
    db.commit()

    return {"message": "Video progress tracked successfully."}

@app.post("/videos/{video_id}/watch/", dependencies=[Depends(admin_only)])
async def update_watch_history(video_id: int, position: float, db: Session = Depends(get_db)):
    user_id = 1  # Use JWT to get the authenticated user

    # Check if a watch history already exists for this video
    history = db.query(UserWatchHistory).filter_by(user_id=user_id, video_id=video_id).first()
    if history:
        history.last_position = position
        history.last_watched_time = func.now()
    else:
        new_history = UserWatchHistory(user_id=user_id, video_id=video_id, last_position=position)
        db.add(new_history)

    db.commit()
    return {"message": "Watch history updated"}


@app.get("/users/{user_id}/continue-watching/")
async def get_continue_watching(user_id: int, db: Session = Depends(get_db)):
    # Retrieve all videos that the user hasn't finished watching
    watch_history = db.query(UserWatchHistory).filter(UserWatchHistory.user_id == user_id).all()

    if not watch_history:
        raise HTTPException(status_code=404, detail="No watch history found")

    return watch_history


@app.post("/videos/{video_id}/view/", dependencies=[Depends(admin_only)])
async def increment_video_view(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if video:
        video.views_count += 1
        db.commit()
        return {"views_count": video.views_count}
    else:
        raise HTTPException(status_code=404, detail="Video not found")
    
    
@app.post("/token/", dependencies=[Depends(admin_only)])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Query the auth_user table directly (Django's user table)
    user = db.execute("SELECT * FROM users WHERE username = :username", {'username': form_data.username}).fetchone()

    if not user or not verify_password(form_data.password, user['password']):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Create a JWT token for the user
    access_token = create_access_token(data={"sub": user['username']})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/me/")
async def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    from models import User  # Import User model
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# API to submit a rating for a video
@app.post("/videos/{video_id}/rate/", response_model=RatingResponse, dependencies=[Depends(admin_only)])
async def rate_video(video_id: int, rating_data: RatingCreate, db: Session = Depends(get_db), user_id: int = 1):
    # Assuming user_id comes from authentication (use JWT in production)
    # Validate the rating value
    if rating_data.rating < 1 or rating_data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")
    
    # Check if the video exists
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found.")
    
    # Create a new rating
    new_rating = VideoRatings(
        user_id=user_id,  # This would normally come from the authenticated user
        video_id=video_id,
        rating=rating_data.rating
    )

    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)

    return new_rating


# API to fetch all ratings for a video
@app.get("/videos/{video_id}/ratings/", response_model=List[RatingResponse])
async def get_video_ratings(video_id: int, db: Session = Depends(get_db)):
    # Fetch all ratings for the specified video
    ratings = db.query(VideoRatings).filter(VideoRatings.video_id == video_id).all()

    if not ratings:
        raise HTTPException(status_code=404, detail="No ratings found for this video.")
    
    return ratings



@app.get("/videos/{video_id}/user-rating/", response_model=RatingResponse)
async def get_user_video_rating(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Extract the user_id from the current_user object
    user_id = current_user.id

    # Fetch the rating for the specified video and user
    rating = db.query(VideoRatings).filter(
        VideoRatings.video_id == video_id,
        VideoRatings.user_id == user_id
    ).first()

    if not rating:
        raise HTTPException(status_code=404, detail="No rating found for this video by the current user.")

    # Return the correct response with all required fields
    return {
        "video_id": video_id,
        "rating": rating.rating,
        "user_id": rating.user_id,  # Include user_id in the response
        "rated_at": rating.rated_at  # Include the correct timestamp of the rating
    }


@app.put("/users/{user_id}/set-admin/", dependencies=[Depends(admin_only)])
async def set_user_admin_status(
    user_id: int,
    admin_status: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure the user is an admin to perform this operation
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="You do not have permission to modify admin status.")

    # Fetch the specific user by user_id
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update admin status for the specified user
    user.is_admin = admin_status
    db.commit()

    return {"message": f"User {'set as admin' if admin_status else 'removed from admin'} successfully."}





@app.post("/users/{user_id}/profile/", dependencies=[Depends(admin_only)])
async def create_user_profile(
    user_id: int,
    profile_pic: str,
    username: str,
    name: str,
    email: str,
    dob: str,  # This will still be passed as a string from the request
    db: Session = Depends(get_db)
):
    # Convert the dob string to a Python date object (assuming format is dd/mm/yyyy)
    try:
        dob_date = datetime.strptime(dob, "%d/%m/%Y").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Expected format: dd/mm/yyyy")
    
    # Check if the user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Create a new user profile
    new_profile = UserProfile(
        user_id=user_id,
        profile_pic=profile_pic,
        username=username,
        name=name,
        email=email,
        dob=dob_date  # Use the converted date object
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return {"message": "User profile created", "profile": new_profile}




@app.get("/users/{user_id}/profiles/")
async def get_profiles(user_id: int, db: Session = Depends(get_db)):
    # Raw SQL query to get profiles for the user
    query = text("SELECT * FROM user_profiles WHERE user_id = :user_id")
    profiles = db.execute(query, {'user_id': user_id}).fetchall()

    if not profiles:
        raise HTTPException(status_code=404, detail="No profiles found")

    # Convert each row to a dictionary using the _mapping attribute
    profiles_list = [dict(row._mapping) for row in profiles]

    return profiles_list


@app.put("/users/{user_id}/profiles/edit/", dependencies=[Depends(admin_only)])
async def edit_profile(
    user_id: int,
    username: str = Form(...),
    name: str = Form(...),
    email: str = Form(...),
    dob: str = Form(...),
    profile_pic: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    # Convert the dob string to a Python date object (assuming format is dd/mm/yyyy)
    try:
        dob_date = datetime.strptime(dob, "%d/%m/%Y").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Expected format: dd/mm/yyyy")
    
    # Fetch the existing profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Update profile details
    profile.username = username
    profile.name = name
    profile.email = email
    profile.dob = dob_date

    # Handle profile picture upload
    if profile_pic:
        profile_pic_filename = f"profile_pics/{user_id}_{profile_pic.filename}"
        with open(profile_pic_filename, "wb+") as buffer:
            shutil.copyfileobj(profile_pic.file, buffer)
        profile.profile_pic = profile_pic_filename

    db.commit()
    db.refresh(profile)

    return {"message": "Profile updated successfully", "profile": profile}



@app.post("/videos/upload/", dependencies=[Depends(admin_only)])
async def upload_video(file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_location = f"uploaded_videos/{file.filename}"
    with open(file_location, "wb+") as buffer:
        shutil.copyfileobj(file.file, buffer)

    new_video = Video(video_file_url=file_location, is_processed=False)
    db.add(new_video)
    db.commit()
    db.refresh(new_video)

    # Trigger Celery task to process the video
    process_video.delay(new_video.id, file_location, f"uploaded_videos/{new_video.id}/")

    return {"message": "Video uploaded, processing started"}



# API to get all videos in the database
@app.get("/videos/")
def get_videos(db: Session = Depends(get_db)):
    videos = db.query(Video).all()
    return [
        {
            "id": video.id,
            "title": video.title,
            "description": video.description,
            "video_file_url": video.video_file_url,
            "thumbnail_url": video.thumbnail_url or "https://example.com/default-thumbnail.jpg",
            "upload_time": video.upload_time,
            "duration": video.duration or 0,  # Use 0 if duration is None
            "video_type": video.video_type or "unknown",  # Use 'unknown' if video_type is None
            "season": video.season,
            "episode": video.episode,
            "is_processed": video.is_processed,
            "views_count": video.views_count
        } for video in videos
    ]


@app.get("/videos/{video_id}")
def get_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    return {
        "id": video.id,
        "title": video.title,
        "description": video.description,
        "video_file_url": video.video_file_url
    }

@app.get("/videos/{video_id}/details")
def get_video_details(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Assuming we have a separate Rating model/table
    rating = db.query(func.avg(VideoRatings.score)).filter(VideoRatings.video_id == video_id).scalar()
    
    return {
        "id": video.id,
        "title": video.title,
        "description": video.description,
        "upload_date": video.upload_date.strftime("%Y-%m-%d %H:%M:%S"),
        "duration": video.duration,  # Assuming we store duration in the Video model
        "rating": round(rating, 2) if rating else None
    }

@app.put("/videos/{video_id}/edit", dependencies=[Depends(admin_only)])
def edit_video(video_id: int, video_data: VideoCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Ensure the user is an admin
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="You do not have permission to edit video details.")

    # Retrieve the video to be updated
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Update video fields
    video.title = video_data.title if video_data.title else video.title
    video.description = video_data.description if video_data.description else video.description
    video.video_file_url = video_data.video_file_url if video_data.video_file_url else video.video_file_url
    video.thumbnail_url = video_data.thumbnail_url if video_data.thumbnail_url else video.thumbnail_url
    video.upload_time = video_data.upload_time if video_data.upload_time else video.upload_time
    video.duration = video_data.duration if video_data.duration else video.duration
    video.video_type = video_data.video_type if video_data.video_type else video.video_type
    video.season = video_data.season if video_data.season else video.season
    video.episode = video_data.episode if video_data.episode else video.episode
    video.is_processed = video_data.is_processed if video_data.is_processed is not None else video.is_processed

    # Commit changes to the database
    db.commit()

    return {"message": "Video updated successfully", "video_id": video_id}



@app.get("/uploaded_videos/{filename}")
async def get_video(filename: str):
    file_path = f"./uploaded_videos/{filename}"
    return FileResponse(file_path, media_type="video/mp4")


@app.delete("/users/{user_id}/delete", dependencies=[Depends(admin_only)])
async def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Ensure the user is an admin
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="You do not have permission to delete users.")

    # Retrieve the user to be deleted
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Delete the user
    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully"}

@app.delete("/videos/{video_id}/delete", dependencies=[Depends(admin_only)])
async def delete_video(video_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Ensure the user is an admin
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="You do not have permission to delete videos.")

    # Retrieve the video to be deleted
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Delete associated ratings
    db.query(VideoRatings).filter(VideoRatings.video_id == video_id).delete()

    # Delete associated views
    db.query(VideoViews).filter(VideoViews.video_id == video_id).delete()

    # Delete the video
    db.delete(video)
    db.commit()

    return {"message": "Video and all associated data deleted successfully"}


@app.post("/api/videos/{video_id}/increment-view", dependencies=[Depends(admin_only)])
async def increment_view_count(video_id: int, db: Session = Depends(get_db)):
    # Fetch the video from the database
    video = db.query(Video).filter(Video.id == video_id).first()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Increment the view count
    video.view_count += 1
    db.commit()

    return {"message": "View count incremented successfully"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the Video Streaming API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
