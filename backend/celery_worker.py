#!/usr/bin/env python
from app.config import CELERY_BROKER_URL, CELERY_RESULT_BACKEND
from celery import Celery
import logging
import os
import sys

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Celery app
app = Celery(
    "code_indexer",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    include=["app.ingest"]
)

# Configure Celery
app.conf.update(
    result_expires=3600,  # Results expire after 1 hour
    worker_prefetch_multiplier=1,  # Disable prefetching for fair task distribution
    task_acks_late=True,  # Tasks are acknowledged after execution
    task_track_started=True,  # Track when tasks are started
    task_time_limit=600,  # Time limit for tasks (10 minutes)
    task_soft_time_limit=300,  # Soft time limit for tasks (5 minutes)
)

if __name__ == "__main__":
    logger.info("Starting Celery worker...")
    # Use direct command execution
    os.system("celery -A celery_worker worker --loglevel=info")
