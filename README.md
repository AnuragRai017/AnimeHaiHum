# Project Setup

This project consists of a FastAPI backend running on port 8001 and a frontend built with Bun.

## Prerequisites

Make sure you have the following software installed:

- Python 3.8+
- Bun (https://bun.sh/)
- Git

## Backend Setup (FastAPI)

1. Clone the repository:
   ```sh
   git clone https://github.com/AnuragRai017/Anime_project.git
   cd Anime_project/fastapi_backend

python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

uvicorn main:app --host 0.0.0.0 --port 8001 --reload

bun install
bun run dev

alembic revision --autogenerate -m "Add new fileds in table" 
alembic upgrade head --  when chnage in fast API models
