import requests

DJANGO_API_URL = "http://localhost:8000/api/sync-video/"

def sync_to_django(data):
    response = requests.post(DJANGO_API_URL, json=data)
    if response.status_code == 200:
        print("Django database updated successfully")
    else:
        print("Failed to sync Django database")
