# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=production
ENV PORT=4002

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated

# Create uploads directory
RUN mkdir -p /app/uploads

# Create entrypoint script with better error handling
RUN echo '#!/bin/sh' > /app/docker-entrypoint.sh && \
    echo 'set -e' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo 'echo "Waiting for database to be ready..."' >> /app/docker-entrypoint.sh && \
    echo 'sleep 5' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo 'echo "Running Prisma migrations..."' >> /app/docker-entrypoint.sh && \
    echo 'MAX_RETRIES=5' >> /app/docker-entrypoint.sh && \
    echo 'RETRY_COUNT=0' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo 'until npx prisma migrate deploy || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do' >> /app/docker-entrypoint.sh && \
    echo '  RETRY_COUNT=$((RETRY_COUNT+1))' >> /app/docker-entrypoint.sh && \
    echo '  echo "Migration failed, attempt $RETRY_COUNT of $MAX_RETRIES. Retrying in 10 seconds..."' >> /app/docker-entrypoint.sh && \
    echo '  sleep 10' >> /app/docker-entrypoint.sh && \
    echo 'done' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo 'if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then' >> /app/docker-entrypoint.sh && \
    echo '  echo "Failed to run migrations after $MAX_RETRIES attempts"' >> /app/docker-entrypoint.sh && \
    echo '  exit 1' >> /app/docker-entrypoint.sh && \
    echo 'fi' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo 'echo "Migrations completed successfully!"' >> /app/docker-entrypoint.sh && \
    echo 'echo "Starting application..."' >> /app/docker-entrypoint.sh && \
    echo 'exec "$@"' >> /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

# Expose port
EXPOSE 4002

# Set entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Start the application
CMD ["pnpm", "run", "start:prod"]