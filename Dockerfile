# Use official Node.js image, we'll use the Long term support version. Also the alpine image is smaller
FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
#  Install pnpm globally
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy rest of the app
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5000

# Start the app
CMD ["pnpm", "run", "dev"]
