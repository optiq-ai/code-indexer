from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import List, Optional, Dict, Any
from celery import Celery
from celery.result import AsyncResult
import uvicorn
import os
import json
from datetime import datetime

from app.config import DATABASE_URL, CELERY_BROKER_URL, MAX_PAYLOAD_SIZE
from app.models import Base, CodeChunk, ChunkRelation, Template
from app.utils import (
    detect_language, is_code, generate_embedding, generate_description,
    complete_code, chunk_code, is_incomplete_code
)
from app.ingest import process_code_chunk

# Initialize FastAPI app
app = FastAPI(
    title="Code Indexer API",
    description="API for managing, searching, and manipulating code snippets",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Celery setup
celery_app = Celery("code_indexer", broker=CELERY_BROKER_URL)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API endpoints
@app.get("/")
def read_root():
    return {"message": "Welcome to Code Indexer API"}

@app.post("/ingest/")
async def ingest_code(
    background_tasks: BackgroundTasks,
    file: Optional[UploadFile] = File(None),
    code: Optional[str] = Form(None),
    name: Optional[str] = Form(None),
    language: Optional[str] = Form(None),
    max_tokens: Optional[int] = Form(1000),
    overlap: Optional[int] = Form(50),
    db: Session = Depends(get_db)
):
    # Validate input
    if file is None and code is None:
        raise HTTPException(status_code=400, detail="Either file or code must be provided")
    
    if file:
        # Check file size
        file_size = 0
        content = b""
        while True:
            chunk = await file.read(1024)
            if not chunk:
                break
            content += chunk
            file_size += len(chunk)
            if file_size > MAX_PAYLOAD_SIZE:
                raise HTTPException(status_code=400, detail=f"File size exceeds maximum allowed ({MAX_PAYLOAD_SIZE} bytes)")
        
        code = content.decode("utf-8", errors="replace")
        if not name:
            name = file.filename
    
    if not code:
        raise HTTPException(status_code=400, detail="Empty code content")
    
    # Check if input is actually code
    if not is_code(code):
        raise HTTPException(status_code=400, detail="Input does not appear to be code")
    
    # Detect language if not provided
    if not language:
        language = detect_language(code)
        if language == "unknown":
            raise HTTPException(status_code=400, detail="Could not detect programming language")
    
    # Generate a default name if not provided
    if not name:
        name = f"{language}_snippet_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Process code in background
    task = celery_app.send_task(
        "app.ingest.process_code",
        args=[code, name, language, max_tokens, overlap]
    )
    
    return {"task_id": task.id, "status": "Processing code in background"}

@app.get("/status/{task_id}")
def get_task_status(task_id: str):
    task_result = AsyncResult(task_id, app=celery_app)
    
    if task_result.state == 'PENDING':
        response = {
            'status': 'pending',
            'info': 'Task is pending execution'
        }
    elif task_result.state == 'FAILURE':
        response = {
            'status': 'failure',
            'info': str(task_result.info)
        }
    elif task_result.state == 'SUCCESS':
        response = {
            'status': 'success',
            'info': task_result.result
        }
    else:
        response = {
            'status': task_result.state,
            'info': str(task_result.info)
        }
    
    return response

@app.get("/search/")
def search_code(
    query: str = Query(..., min_length=1),
    language: Optional[str] = None,
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    # Generate embedding for the query
    try:
        query_embedding = generate_embedding(query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate embedding: {str(e)}")
    
    # Perform vector similarity search
    base_query = db.query(CodeChunk)
    
    if language:
        base_query = base_query.filter(CodeChunk.language == language)
    
    # Use PostgreSQL's vector similarity search
    results = (
        base_query
        .order_by(
            CodeChunk.embedding.op("<=>")(query_embedding).asc()
        )
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": chunk.id,
            "name": chunk.name,
            "language": chunk.language,
            "description": chunk.description,
            "raw": chunk.raw,
            "incomplete": chunk.incomplete,
            "created_at": chunk.created_at.isoformat() if chunk.created_at else None
        }
        for chunk in results
    ]

@app.get("/chunks/{chunk_id}")
def get_chunk(chunk_id: int, db: Session = Depends(get_db)):
    chunk = db.query(CodeChunk).filter(CodeChunk.id == chunk_id).first()
    if not chunk:
        raise HTTPException(status_code=404, detail="Chunk not found")
    
    return {
        "id": chunk.id,
        "name": chunk.name,
        "language": chunk.language,
        "description": chunk.description,
        "raw": chunk.raw,
        "incomplete": chunk.incomplete,
        "created_at": chunk.created_at.isoformat() if chunk.created_at else None
    }

@app.post("/chunks/split/")
def split_chunk(
    chunk_id: int = Form(...),
    max_tokens: int = Form(1000),
    overlap: int = Form(50),
    db: Session = Depends(get_db)
):
    # Get the chunk to split
    chunk = db.query(CodeChunk).filter(CodeChunk.id == chunk_id).first()
    if not chunk:
        raise HTTPException(status_code=404, detail="Chunk not found")
    
    # Split the code
    code_chunks = chunk_code(chunk.raw, max_tokens, overlap)
    
    if len(code_chunks) <= 1:
        raise HTTPException(status_code=400, detail="Chunk is too small to split")
    
    # Create new chunks
    new_chunk_ids = []
    for i, code in enumerate(code_chunks):
        # Check if code is incomplete
        incomplete = is_incomplete_code(code, chunk.language)
        
        # Generate description
        description = generate_description(code, chunk.language)
        
        # Generate embedding
        embedding = generate_embedding(code)
        
        # Create new chunk
        new_chunk = CodeChunk(
            language=chunk.language,
            name=f"{chunk.name}_part_{i+1}",
            description=description,
            raw=code,
            embedding=embedding,
            incomplete=incomplete,
            type="code"
        )
        
        db.add(new_chunk)
        db.flush()  # Get the ID without committing
        
        # Create relation to parent
        relation = ChunkRelation(
            parent_id=chunk_id,
            child_id=new_chunk.id
        )
        
        db.add(relation)
        new_chunk_ids.append(new_chunk.id)
    
    db.commit()
    
    return {"parent_id": chunk_id, "child_ids": new_chunk_ids}

@app.post("/chunks/merge/")
def merge_chunks(
    chunk_ids: List[int] = Form(...),
    name: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    if len(chunk_ids) < 2:
        raise HTTPException(status_code=400, detail="At least two chunks are required for merging")
    
    # Get all chunks to merge
    chunks = db.query(CodeChunk).filter(CodeChunk.id.in_(chunk_ids)).all()
    
    if len(chunks) != len(chunk_ids):
        raise HTTPException(status_code=404, detail="One or more chunks not found")
    
    # Check if all chunks have the same language
    languages = set(chunk.language for chunk in chunks)
    if len(languages) > 1:
        raise HTTPException(status_code=400, detail="All chunks must have the same language")
    
    # Sort chunks by ID (assuming ID order is meaningful)
    chunks.sort(key=lambda x: chunk_ids.index(x.id))
    
    # Merge code
    merged_code = "\n\n".join(chunk.raw for chunk in chunks)
    
    # Generate name if not provided
    if not name:
        name = f"merged_{'_'.join(str(id) for id in chunk_ids)}"
    
    # Generate description
    description = generate_description(merged_code, chunks[0].language)
    
    # Generate embedding
    embedding = generate_embedding(merged_code)
    
    # Create new chunk
    new_chunk = CodeChunk(
        language=chunks[0].language,
        name=name,
        description=description,
        raw=merged_code,
        embedding=embedding,
        incomplete=any(chunk.incomplete for chunk in chunks),
        type="code"
    )
    
    db.add(new_chunk)
    db.flush()  # Get the ID without committing
    
    # Create relations to parent chunks
    for chunk_id in chunk_ids:
        relation = ChunkRelation(
            parent_id=chunk_id,
            child_id=new_chunk.id
        )
        db.add(relation)
    
    db.commit()
    
    return {
        "id": new_chunk.id,
        "name": new_chunk.name,
        "parent_ids": chunk_ids
    }

@app.post("/chunks/complete/")
def complete_chunk(
    chunk_id: int = Form(...),
    db: Session = Depends(get_db)
):
    # Get the chunk to complete
    chunk = db.query(CodeChunk).filter(CodeChunk.id == chunk_id).first()
    if not chunk:
        raise HTTPException(status_code=404, detail="Chunk not found")
    
    if not chunk.incomplete:
        return {"id": chunk.id, "message": "Chunk is already complete"}
    
    # Complete the code
    completed_code = complete_code(chunk.raw, chunk.language)
    
    # Update the chunk
    chunk.raw = completed_code
    chunk.incomplete = False
    
    # Update embedding and description
    chunk.embedding = generate_embedding(completed_code)
    chunk.description = generate_description(completed_code, chunk.language)
    
    db.commit()
    
    return {
        "id": chunk.id,
        "name": chunk.name,
        "language": chunk.language,
        "description": chunk.description,
        "raw": chunk.raw,
        "incomplete": chunk.incomplete
    }

@app.get("/templates/")
def list_templates(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    templates = db.query(Template).offset(skip).limit(limit).all()
    
    return [
        {
            "id": template.id,
            "name": template.name,
            "description": template.description,
            "created_at": template.created_at.isoformat() if template.created_at else None,
            "chunk_count": len(template.chunks)
        }
        for template in templates
    ]

@app.post("/templates/")
def create_template(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    chunk_ids: List[int] = Form(...),
    db: Session = Depends(get_db)
):
    # Check if chunks exist
    chunks = db.query(CodeChunk).filter(CodeChunk.id.in_(chunk_ids)).all()
    if len(chunks) != len(chunk_ids):
        raise HTTPException(status_code=404, detail="One or more chunks not found")
    
    # Create template
    template = Template(
        name=name,
        description=description
    )
    
    db.add(template)
    db.flush()  # Get the ID without committing
    
    # Add chunks to template with positions
    for i, chunk_id in enumerate(chunk_ids):
        db.execute(
            "INSERT INTO template_chunks (template_id, chunk_id, position) VALUES (:template_id, :chunk_id, :position)",
            {"template_id": template.id, "chunk_id": chunk_id, "position": i}
        )
    
    db.commit()
    
    return {
        "id": template.id,
        "name": template.name,
        "description": template.description,
        "chunk_ids": chunk_ids
    }

@app.get("/templates/{template_id}")
def get_template(template_id: int, db: Session = Depends(get_db)):
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Get chunks with their positions
    chunks = []
    for chunk in template.chunks:
        position = db.execute(
            "SELECT position FROM template_chunks WHERE template_id = :template_id AND chunk_id = :chunk_id",
            {"template_id": template_id, "chunk_id": chunk.id}
        ).scalar()
        
        chunks.append({
            "id": chunk.id,
            "name": chunk.name,
            "language": chunk.language,
            "description": chunk.description,
            "position": position
        })
    
    # Sort chunks by position
    chunks.sort(key=lambda x: x["position"])
    
    return {
        "id": template.id,
        "name": template.name,
        "description": template.description,
        "created_at": template.created_at.isoformat() if template.created_at else None,
        "chunks": chunks
    }

@app.post("/templates/{template_id}/apply/")
def apply_template(
    template_id: int,
    parameters: Dict[str, Any] = Form(...),
    db: Session = Depends(get_db)
):
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Get chunks with their positions
    chunks = []
    for chunk in template.chunks:
        position = db.execute(
            "SELECT position FROM template_chunks WHERE template_id = :template_id AND chunk_id = :chunk_id",
            {"template_id": template_id, "chunk_id": chunk.id}
        ).scalar()
        
        chunks.append({
            "id": chunk.id,
            "raw": chunk.raw,
            "language": chunk.language,
            "position": position
        })
    
    # Sort chunks by position
    chunks.sort(key=lambda x: x["position"])
    
    # Apply parameters to template
    combined_code = ""
    for chunk in chunks:
        code = chunk["raw"]
        
        # Replace placeholders with parameters
        for key, value in parameters.items():
            placeholder = f"{{{{${key}}}}}"
            code = code.replace(placeholder, str(value))
        
        combined_code += code + "\n\n"
    
    # Generate name
    name = f"{template.name}_applied_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Generate description
    description = f"Generated from template: {template.name}"
    if template.description:
        description += f"\nTemplate description: {template.description}"
    
    # Detect language (use the language of the first chunk)
    language = chunks[0]["language"] if chunks else "unknown"
    
    # Generate embedding
    embedding = generate_embedding(combined_code)
    
    # Create new chunk
    new_chunk = CodeChunk(
        language=language,
        name=name,
        description=description,
        raw=combined_code,
        embedding=embedding,
        incomplete=False,
        type="code"
    )
    
    db.add(new_chunk)
    db.commit()
    
    return {
        "id": new_chunk.id,
        "name": new_chunk.name,
        "language": new_chunk.language,
        "description": new_chunk.description,
        "raw": new_chunk.raw
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
