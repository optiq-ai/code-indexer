from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector

Base = declarative_base()

# Association table for many-to-many relationship between templates and chunks
template_chunks = Table(
    'template_chunks',
    Base.metadata,
    Column('template_id', Integer, ForeignKey('templates.id'), primary_key=True),
    Column('chunk_id', Integer, ForeignKey('code_chunks.id'), primary_key=True),
    Column('position', Integer, nullable=False)
)

class CodeChunk(Base):
    __tablename__ = "code_chunks"

    id = Column(Integer, primary_key=True, index=True)
    language = Column(String(50), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    raw = Column(Text, nullable=False)
    embedding = Column(Vector(1536))  # OpenAI Ada embedding dimension
    incomplete = Column(Boolean, default=False, index=True)
    type = Column(String(50), default="code", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    children = relationship(
        "CodeChunk",
        secondary="chunk_relations",
        primaryjoin="CodeChunk.id==chunk_relations.c.parent_id",
        secondaryjoin="CodeChunk.id==chunk_relations.c.child_id",
        backref="parents"
    )
    
    templates = relationship(
        "Template",
        secondary=template_chunks,
        back_populates="chunks"
    )

class ChunkRelation(Base):
    __tablename__ = "chunk_relations"

    parent_id = Column(Integer, ForeignKey("code_chunks.id", ondelete="CASCADE"), primary_key=True)
    child_id = Column(Integer, ForeignKey("code_chunks.id", ondelete="CASCADE"), primary_key=True)

class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    chunks = relationship(
        "CodeChunk",
        secondary=template_chunks,
        back_populates="templates"
    )
