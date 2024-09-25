import os
import subprocess
from celery import Celery
from sqlalchemy.orm import Session
from database import SessionLocal  # Assuming your session setup is here
from models import Video  # Import your SQLAlchemy Video model

# Initialize Celery with RabbitMQ as the broker
celery = Celery('tasks', broker='amqp://myuser:mypassword@192.168.103.46:5672/myvhost')
celery.conf.update(
    broker_connection_retry_on_startup=True  # Add this line to ensure retries if the connection fails
)

@celery.task
def process_video(video_id: int, input_file: str, output_dir: str):
    """
    This task processes the video using FFmpeg to create multi-resolution HLS streams.
    It then updates the database to mark the video as processed and store the HLS master URL.
    """

    # Ensure the output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # FFmpeg HLS command for multi-resolution with -movflags +faststart to ensure proper metadata handling
    command = [
        'ffmpeg', '-i', input_file,
        '-filter_complex', '[0:v]split=3[v1][v2][v3]',
        '-map', '[v1]', '-map', '[v2]', '-map', '[v3]', '-map', '0:a',
        '-preset', 'fast', '-g', '48', '-sc_threshold', '0',
        '-map', '0:0', '-map', '0:1',
        '-s:v:0', '1920x1080', '-b:v:0', '5000k',
        '-s:v:1', '1280x720', '-b:v:1', '3000k',
        '-s:v:2', '854x480', '-b:v:2', '1500k',
        '-c:v:0', 'libx264', '-c:a:0', 'aac',
        '-movflags', '+faststart',  # Ensure faststart for better metadata handling
        '-f', 'hls', '-hls_time', '4', '-hls_playlist_type', 'vod',
        '-master_pl_name', 'master.m3u8',
        '-var_stream_map', 'v:0,a:0 v:1,a:0 v:2,a:0',
        os.path.join(output_dir, 'output_%v.m3u8')
    ]

    try:
        # Run FFmpeg command and capture output for debugging
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        print(f"FFmpeg output:\n{result.stdout}")  # Log FFmpeg output for debugging

        # Update the video entry in the database
        db = SessionLocal()
        video = db.query(Video).filter(Video.id == video_id).first()
        if video:
            video.is_processed = True
            video.hls_master_url = os.path.join(output_dir, 'master.m3u8')
            db.commit()
        else:
            print(f"Video with ID {video_id} not found in the database.")

    except subprocess.CalledProcessError as e:
        print(f"Error processing video: {e.stderr}")  # Print FFmpeg error logs
        # Optionally log this error to a file or a monitoring system
    except Exception as e:
        print(f"Database error: {e}")
        db.rollback()  # Rollback the transaction in case of a database error
    finally:
        db.close()  # Ensure the session is closed

