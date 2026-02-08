# Frontend Dockerfile for Nuxt 4

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies WITH optional deps explicitly
RUN npm install --legacy-peer-deps

# Copy source code
COPY frontend/ ./

# Build Nuxt application
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install production dependencies
RUN npm install --omit=dev --legacy-peer-deps

# Copy built application from builder
COPY --from=builder /app/.output ./.output

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Start application
CMD ["node", ".output/server/index.mjs"]
