# Frontend Dockerfile for Nuxt 4

FROM node:20-bullseye AS builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies WITHOUT running postinstall scripts
RUN npm install --legacy-peer-deps --ignore-scripts

# Copy source code
COPY frontend/ ./

# Now run postinstall manually
RUN npm run postinstall

# Build Nuxt application
RUN npm run build

# Runtime stage
FROM node:20-bullseye

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install production dependencies only
RUN npm install --omit=dev --legacy-peer-deps --ignore-scripts

# Copy built application from builder
COPY --from=builder /app/.output ./.output

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start application
CMD ["node", ".output/server/index.mjs"]
