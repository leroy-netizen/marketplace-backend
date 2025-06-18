# Deployment and DevOps

## Docker Configuration

The application is containerized using Docker:

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json
