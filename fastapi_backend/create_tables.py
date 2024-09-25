# create_tables.py

from database import engine, Base
from models import Video  # Import all your models here (User, Video, etc.)

# Create all tables
Base.metadata.create_all(bind=engine)
