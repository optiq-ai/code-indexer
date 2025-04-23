-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create tables
CREATE TABLE IF NOT EXISTS code_chunks (
    id SERIAL PRIMARY KEY,
    language VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    raw TEXT NOT NULL,
    embedding vector(1536),  -- OpenAI Ada embedding dimension
    incomplete BOOLEAN DEFAULT FALSE,
    type VARCHAR(50) DEFAULT 'code',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chunk_relations (
    parent_id INTEGER REFERENCES code_chunks(id) ON DELETE CASCADE,
    child_id INTEGER REFERENCES code_chunks(id) ON DELETE CASCADE,
    PRIMARY KEY (parent_id, child_id)
);

CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS template_chunks (
    template_id INTEGER REFERENCES templates(id) ON DELETE CASCADE,
    chunk_id INTEGER REFERENCES code_chunks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    PRIMARY KEY (template_id, chunk_id)
);

-- Create indexes for faster searches
CREATE INDEX IF NOT EXISTS idx_code_chunks_language ON code_chunks(language);
CREATE INDEX IF NOT EXISTS idx_code_chunks_type ON code_chunks(type);
CREATE INDEX IF NOT EXISTS idx_code_chunks_incomplete ON code_chunks(incomplete);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_code_chunks_embedding ON code_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Comments
COMMENT ON TABLE code_chunks IS 'Stores code fragments with their embeddings and metadata';
COMMENT ON TABLE chunk_relations IS 'Stores parent-child relationships between code chunks';
COMMENT ON TABLE templates IS 'Stores templates for code generation';
COMMENT ON TABLE template_chunks IS 'Maps chunks to templates with position information';
