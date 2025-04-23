import os
from celery import Celery
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import logging

from app.config import CELERY_BROKER_URL, CELERY_RESULT_BACKEND, DATABASE_URL
from app.models import Base, CodeChunk
from app.utils import detect_language, generate_embedding, generate_description, chunk_code, is_incomplete_code

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Celery
celery_app = Celery("code_indexer", broker=CELERY_BROKER_URL, backend=CELERY_RESULT_BACKEND)

# Database setup
engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@celery_app.task(name="app.ingest.process_code")
def process_code(code, name, language, max_tokens=1000, overlap=50):
    """
    Process code by chunking, generating embeddings and descriptions.
    
    Args:
        code: The code to process
        name: Name for the code snippet
        language: Programming language of the code
        max_tokens: Maximum tokens per chunk
        overlap: Number of overlapping tokens between chunks
        
    Returns:
        Dictionary with processing results
    """
    logger.info(f"Processing code: {name}, language: {language}")
    
    try:
        # Chunk the code
        code_chunks = chunk_code(code, max_tokens, overlap)
        logger.info(f"Split into {len(code_chunks)} chunks")
        
        # Process each chunk
        chunk_ids = []
        for i, chunk_code in enumerate(code_chunks):
            chunk_id = process_code_chunk(
                chunk_code, 
                f"{name}_chunk_{i+1}" if len(code_chunks) > 1 else name,
                language
            )
            chunk_ids.append(chunk_id)
        
        return {
            "status": "success",
            "message": f"Processed {len(code_chunks)} chunks",
            "chunk_ids": chunk_ids
        }
    
    except Exception as e:
        logger.error(f"Error processing code: {str(e)}")
        return {
            "status": "error",
            "message": f"Failed to process code: {str(e)}"
        }

def process_code_chunk(code, name, language):
    """
    Process a single code chunk.
    
    Args:
        code: The code chunk to process
        name: Name for the chunk
        language: Programming language of the code
        
    Returns:
        ID of the created chunk
    """
    # Check if code is incomplete
    incomplete = is_incomplete_code(code, language)
    
    # Generate description
    description = generate_description(code, language)
    
    # Generate embedding
    embedding = generate_embedding(code)
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Create new chunk
        chunk = CodeChunk(
            language=language,
            name=name,
            description=description,
            raw=code,
            embedding=embedding,
            incomplete=incomplete,
            type="code"
        )
        
        db.add(chunk)
        db.commit()
        db.refresh(chunk)
        
        return chunk.id
    
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving chunk to database: {str(e)}")
        raise
    
    finally:
        db.close()

if __name__ == "__main__":
    celery_app.start()
