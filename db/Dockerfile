FROM postgres:15

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    postgresql-server-dev-15 \
    && rm -rf /var/lib/apt/lists/*

# Clone and build pgvector
RUN git clone --branch v0.5.1 https://github.com/pgvector/pgvector.git \
    && cd pgvector \
    && make \
    && make install

# Create initialization script to enable the extension
RUN echo "#!/bin/bash\nset -e\n\npsql -v ON_ERROR_STOP=1 --username \"\$POSTGRES_USER\" --dbname \"\$POSTGRES_DB\" <<-EOSQL\n  CREATE EXTENSION IF NOT EXISTS vector;\nEOSQL" > /docker-entrypoint-initdb.d/10-create-extension.sh \
    && chmod +x /docker-entrypoint-initdb.d/10-create-extension.sh

# Set environment variables for PostgreSQL
ENV POSTGRES_USER=optiq
ENV POSTGRES_PASSWORD=secure_password
ENV POSTGRES_DB=code_index
