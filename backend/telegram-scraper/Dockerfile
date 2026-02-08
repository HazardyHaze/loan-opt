# Backend Dockerfile for Node.js Telegram Scraper

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY backend/telegram-scraper/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY backend/telegram-scraper/src ./src

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
ENV NODE_ENV=production
CMD ["npm", "start"]
