# celery_app.py

# celery_app.py

from celery import Celery

# Configure RabbitMQ broker and backend for Celery
celery = Celery(
    "tasks",
    broker="amqp://myuser:mypassword@192.168.103.46:5672/myvhost",  # Ensure the correct broker URL
        result_backend = "db+sqlite:///video_streaming.db"
)

# Ensure broker connection retry on startup
celery.conf.update(
    broker_connection_retry_on_startup=True,
    result_backend="rpc://",  # Ensure the correct backend URL
)

# Example task to test Celery
@celery.task
def test_task():
    return "Celery is working!"

