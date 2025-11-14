# Phase 2: Docker Setup

## Goal
Create optimized Docker configuration for the portfolio application, implement multi-stage builds, and test the containerized application locally.

---

## Todo List

### 1. Create Dockerfile
- [ ] Create multi-stage Dockerfile
- [ ] Optimize build layers
- [ ] Configure production runtime
- [ ] Add health check
- [ ] Set up proper user permissions

### 2. Create Docker Compose
- [ ] Create docker-compose.yml for local development
- [ ] Configure PostgreSQL service
- [ ] Configure LocalStack (for S3 testing)
- [ ] Set up networking
- [ ] Add volume mounts

### 3. Create .dockerignore
- [ ] Exclude node_modules
- [ ] Exclude development files
- [ ] Exclude git and docs
- [ ] Optimize build context

### 4. Create Docker Scripts
- [ ] Build script
- [ ] Run script
- [ ] Development script
- [ ] Clean script

### 5. Test Locally
- [ ] Build Docker image
- [ ] Run container locally
- [ ] Test health endpoints
- [ ] Test database connectivity
- [ ] Test file uploads (S3)
- [ ] Performance testing

### 6. Optimize Image
- [ ] Reduce image size
- [ ] Layer caching optimization
- [ ] Security scanning
- [ ] Multi-architecture support (optional)

---

## Detailed Steps

### Step 1: Create Dockerfile

**File:** `Dockerfile`

```dockerfile
# Multi-stage build for optimized production image
# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build frontend
RUN npm run build:client

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build backend
RUN npm run build:server

# Stage 3: Production runtime
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built frontend from frontend-builder
COPY --from=frontend-builder /app/dist/public ./dist/public

# Copy built backend from backend-builder
COPY --from=backend-builder /app/dist/index.js ./dist/

# Copy shared schema (needed at runtime)
COPY shared ./shared

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/index.js"]
```

### Step 2: Create .dockerignore

**File:** `.dockerignore`

```
# Dependencies
node_modules
npm-debug.log
package-lock.json

# Build output
dist
.next
out

# Development files
.env
.env.local
.env.*.local
*.log

# Git
.git
.gitignore
.github

# IDE
.vscode
.idea
*.swp
*.swo
*~

# Documentation
docs
*.md
!README.md

# Test files
coverage
.nyc_output
test
tests
**/*.test.ts
**/*.test.js
**/*.spec.ts
**/*.spec.js

# OS files
.DS_Store
Thumbs.db

# Local development
.replit
.config
.local
uploads
attached_assets

# Replit specific
replit.md
cookies.txt
create-*.js
add-*.js
add-*.ts
hash-*.js
test.jpg

# Misc
.cache
.temp
tmp
```

### Step 3: Create Docker Compose for Local Development

**File:** `docker-compose.yml`

```yaml
version: '3.9'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: portfolio-db
    environment:
      POSTGRES_USER: portfolio
      POSTGRES_PASSWORD: portfolio_dev_password
      POSTGRES_DB: portfolio
      POSTGRES_INITDB_ARGS: "--encoding=UTF8"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U portfolio"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - portfolio-network

  # LocalStack for S3 (local AWS emulation)
  localstack:
    image: localstack/localstack:latest
    container_name: portfolio-localstack
    environment:
      SERVICES: s3
      DEBUG: 1
      DATA_DIR: /tmp/localstack/data
      AWS_DEFAULT_REGION: us-east-1
      EDGE_PORT: 4566
    ports:
      - "4566:4566"
    volumes:
      - localstack_data:/tmp/localstack
      - ./scripts/init-localstack.sh:/etc/localstack/init/ready.d/init-localstack.sh
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4566/_localstack/health"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - portfolio-network

  # Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: portfolio-app
    environment:
      # Database
      DATABASE_URL: postgresql://portfolio:portfolio_dev_password@postgres:5432/portfolio

      # Server
      PORT: 5000
      NODE_ENV: production

      # Session
      SESSION_SECRET: local-development-secret-change-in-production-min-32-chars

      # AWS (using LocalStack)
      AWS_REGION: us-east-1
      AWS_S3_BUCKET: portfolio-uploads
      AWS_ACCESS_KEY_ID: test
      AWS_SECRET_ACCESS_KEY: test
      AWS_ENDPOINT_URL: http://localstack:4566

      # CORS
      CORS_ORIGIN: http://localhost:5000
    ports:
      - "5000:5000"
    depends_on:
      postgres:
        condition: service_healthy
      localstack:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - portfolio-network
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
  localstack_data:
    driver: local

networks:
  portfolio-network:
    driver: bridge
```

### Step 4: Create Supporting Scripts

#### 4.1 LocalStack Initialization Script

**File:** `scripts/init-localstack.sh`

```bash
#!/bin/bash

# Wait for LocalStack to be ready
echo "Waiting for LocalStack to be ready..."
sleep 5

# Create S3 bucket
echo "Creating S3 bucket: portfolio-uploads"
awslocal s3 mb s3://portfolio-uploads

# Set bucket policy for public read (optional)
awslocal s3api put-bucket-acl \
  --bucket portfolio-uploads \
  --acl public-read

# Enable CORS
awslocal s3api put-bucket-cors \
  --bucket portfolio-uploads \
  --cors-configuration '{
    "CORSRules": [{
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }]
  }'

echo "LocalStack S3 setup complete!"
```

Make it executable:

```bash
chmod +x scripts/init-localstack.sh
```

#### 4.2 Database Initialization Script

**File:** `init-db.sql`

```sql
-- Initialize database
-- This file runs when the PostgreSQL container first starts

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Additional initialization can be added here
-- Your Drizzle migrations will handle table creation
```

#### 4.3 Docker Build Script

**File:** `scripts/docker-build.sh`

```bash
#!/bin/bash

# Docker build script with options

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Building Docker image...${NC}"

# Build arguments
IMAGE_NAME="${IMAGE_NAME:-portfolio-app}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
DOCKERFILE="${DOCKERFILE:-Dockerfile}"

# Build with build-time arguments
docker build \
  --file "$DOCKERFILE" \
  --tag "$IMAGE_NAME:$IMAGE_TAG" \
  --build-arg NODE_ENV=production \
  --progress=plain \
  .

echo -e "${GREEN}✅ Build complete!${NC}"
echo -e "${YELLOW}Image: $IMAGE_NAME:$IMAGE_TAG${NC}"

# Show image size
echo -e "${YELLOW}Image size:${NC}"
docker images "$IMAGE_NAME:$IMAGE_TAG" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

Make it executable:

```bash
chmod +x scripts/docker-build.sh
```

#### 4.4 Docker Run Script

**File:** `scripts/docker-run.sh`

```bash
#!/bin/bash

# Docker run script

set -e

IMAGE_NAME="${IMAGE_NAME:-portfolio-app}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
CONTAINER_NAME="${CONTAINER_NAME:-portfolio-app-container}"

# Stop and remove existing container if it exists
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

# Run the container
docker run \
  --name "$CONTAINER_NAME" \
  --env-file .env.docker \
  -p 5000:5000 \
  --detach \
  "$IMAGE_NAME:$IMAGE_TAG"

echo "✅ Container started: $CONTAINER_NAME"
echo "📊 View logs: docker logs -f $CONTAINER_NAME"
echo "🔍 Health check: curl http://localhost:5000/health"
```

Make it executable:

```bash
chmod +x scripts/docker-run.sh
```

#### 4.5 Environment File for Docker

**File:** `.env.docker`

```bash
# Docker environment file
DATABASE_URL=postgresql://portfolio:portfolio_dev_password@host.docker.internal:5432/portfolio
PORT=5000
NODE_ENV=production
SESSION_SECRET=docker-development-secret-change-in-production-min-32-chars
AWS_REGION=us-east-1
AWS_S3_BUCKET=portfolio-uploads
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_ENDPOINT_URL=http://host.docker.internal:4566
CORS_ORIGIN=http://localhost:5000
```

### Step 5: Update S3 Service for LocalStack

**File:** `server/s3Service.ts`

Update the S3Client initialization to support LocalStack:

```typescript
// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  // Support LocalStack for local development
  ...(process.env.AWS_ENDPOINT_URL && {
    endpoint: process.env.AWS_ENDPOINT_URL,
    forcePathStyle: true, // Required for LocalStack
  }),
});
```

### Step 6: Build and Test

#### 6.1 Build the Docker Image

```bash
# Using the build script
./scripts/docker-build.sh

# Or manually
docker build -t portfolio-app:latest .
```

Expected output:
```
[+] Building 120.5s (23/23) FINISHED
...
✅ Build complete!
Image: portfolio-app:latest
```

#### 6.2 Test with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# Expected output:
# NAME                   STATUS              PORTS
# portfolio-app          Up (healthy)        0.0.0.0:5000->5000/tcp
# portfolio-db           Up (healthy)        0.0.0.0:5432->5432/tcp
# portfolio-localstack   Up (healthy)        0.0.0.0:4566->4566/tcp

# View logs
docker-compose logs -f app

# Test health endpoint
curl http://localhost:5000/health

# Test API
curl http://localhost:5000/api/projects
```

#### 6.3 Run Database Migrations

```bash
# Run migrations inside the container
docker-compose exec app npm run db:push

# Or from host (if PostgreSQL port is exposed)
npm run db:push
```

#### 6.4 Test S3 Uploads

```bash
# Test LocalStack S3
aws --endpoint-url=http://localhost:4566 s3 ls s3://portfolio-uploads/

# Upload a test file via API (requires authentication)
# Use your admin credentials to test
```

#### 6.5 Performance Testing

```bash
# Install Apache Bench (if not already installed)
# macOS: brew install httpd
# Ubuntu: sudo apt-get install apache2-utils

# Test performance
ab -n 1000 -c 10 http://localhost:5000/health

# Expected results:
# - Requests per second: > 500
# - Time per request: < 20ms (mean)
```

### Step 7: Optimize Docker Image

#### 7.1 Check Image Size

```bash
docker images portfolio-app:latest

# Target: < 200MB
# If larger, review what's being copied
```

#### 7.2 Analyze Image Layers

```bash
# Use dive to analyze image
# Install: brew install dive (macOS)
dive portfolio-app:latest

# Look for:
# - Large layers
# - Unnecessary files
# - Optimization opportunities
```

#### 7.3 Security Scan

```bash
# Scan for vulnerabilities
docker scout cves portfolio-app:latest

# Or use Trivy
# Install: brew install trivy
trivy image portfolio-app:latest
```

#### 7.4 Multi-Architecture Build (Optional)

For ARM64 (Apple Silicon) and AMD64 compatibility:

```bash
# Create builder
docker buildx create --name multiarch --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag portfolio-app:latest \
  --push \  # Only if pushing to registry
  .
```

### Step 8: Create Makefile for Convenience

**File:** `Makefile`

```makefile
.PHONY: help build run stop clean logs test

# Variables
IMAGE_NAME := portfolio-app
IMAGE_TAG := latest
CONTAINER_NAME := portfolio-app-container

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build Docker image
	@echo "Building Docker image..."
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

build-no-cache: ## Build Docker image without cache
	@echo "Building Docker image (no cache)..."
	docker build --no-cache -t $(IMAGE_NAME):$(IMAGE_TAG) .

run: ## Run the application with docker-compose
	@echo "Starting services..."
	docker-compose up -d

stop: ## Stop the application
	@echo "Stopping services..."
	docker-compose down

restart: stop run ## Restart the application

logs: ## View application logs
	docker-compose logs -f app

logs-all: ## View all service logs
	docker-compose logs -f

clean: ## Clean up containers, images, and volumes
	@echo "Cleaning up..."
	docker-compose down -v
	docker rmi $(IMAGE_NAME):$(IMAGE_TAG) 2>/dev/null || true

test: ## Run health check tests
	@echo "Testing health endpoint..."
	@curl -f http://localhost:5000/health || (echo "Health check failed" && exit 1)
	@echo "\n✅ Health check passed"

shell: ## Open shell in running container
	docker-compose exec app sh

db-shell: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U portfolio -d portfolio

db-migrate: ## Run database migrations
	docker-compose exec app npm run db:push

rebuild: clean build run ## Clean, build, and run

inspect: ## Inspect the Docker image
	@echo "Image size:"
	@docker images $(IMAGE_NAME):$(IMAGE_TAG) --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
	@echo "\nImage layers:"
	@docker history $(IMAGE_NAME):$(IMAGE_TAG)

security-scan: ## Run security scan on image
	@echo "Scanning image for vulnerabilities..."
	docker scout cves $(IMAGE_NAME):$(IMAGE_TAG) || echo "Docker Scout not available"
```

Usage:

```bash
# Build
make build

# Run
make run

# View logs
make logs

# Clean everything
make clean

# Rebuild from scratch
make rebuild
```

---

## Outcome

After completing this phase, you should have:

### ✅ Completed Deliverables

1. **Docker Configuration**
   - ✅ Multi-stage Dockerfile created
   - ✅ .dockerignore optimized
   - ✅ docker-compose.yml for local dev
   - ✅ Supporting scripts created

2. **Testing Infrastructure**
   - ✅ LocalStack for S3 testing
   - ✅ PostgreSQL container
   - ✅ Health checks configured

3. **Build Artifacts**
   - ✅ Docker image builds successfully
   - ✅ Image size optimized (< 200MB)
   - ✅ Security scan passed

4. **Documentation**
   - ✅ Build scripts documented
   - ✅ Makefile for common tasks
   - ✅ Testing procedures documented

### ✅ Validation Checklist

```bash
# 1. Docker image builds
make build
# Expected: Build completes without errors

# 2. Services start
make run
# Expected: All services healthy

# 3. Health check passes
make test
# Expected: ✅ Health check passed

# 4. Database accessible
make db-shell
# Expected: PostgreSQL prompt

# 5. Application responds
curl http://localhost:5000/api/projects
# Expected: JSON response

# 6. Logs are clean
make logs
# Expected: No errors, server running

# 7. Image size acceptable
docker images portfolio-app:latest
# Expected: < 200MB
```

### 📊 Performance Metrics

After successful deployment:

```bash
# Image size
docker images portfolio-app:latest --format "{{.Size}}"
# Target: < 200MB

# Container memory
docker stats portfolio-app --no-stream
# Target: < 150MB

# Health check response time
time curl http://localhost:5000/health
# Target: < 100ms
```

### 🔒 Security Checklist

- ✅ Running as non-root user
- ✅ No secrets in image
- ✅ Security scan passed
- ✅ Minimal base image (Alpine)
- ✅ Health checks configured

---

## Next Steps

Once all validations pass and the Docker setup is working locally, proceed to:
**[Phase 3: AWS Infrastructure Setup →](./04-aws-infrastructure.md)**

---

## Troubleshooting

### Build Fails

**Problem**: npm install fails in Docker
```dockerfile
# Add this before npm ci to increase memory
ENV NODE_OPTIONS="--max-old-space-size=4096"
```

**Problem**: Frontend build times out
```dockerfile
# Increase timeout in Dockerfile
RUN npm run build:client -- --timeout=300000
```

### Container Won't Start

**Problem**: Port already in use
```bash
# Find process using port 5000
lsof -i :5000
# Kill it or use different port
docker-compose down && docker-compose up -d
```

**Problem**: Database connection fails
```bash
# Check PostgreSQL is running
docker-compose ps postgres
# Check connection string
docker-compose exec app env | grep DATABASE_URL
```

### LocalStack S3 Issues

**Problem**: S3 uploads fail
```bash
# Verify bucket exists
aws --endpoint-url=http://localhost:4566 s3 ls

# Check LocalStack logs
docker-compose logs localstack

# Recreate bucket
aws --endpoint-url=http://localhost:4566 s3 mb s3://portfolio-uploads
```

### Performance Issues

**Problem**: Slow response times
```bash
# Check container resources
docker stats portfolio-app

# Check logs for errors
docker-compose logs -f app

# Increase container resources in docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```
