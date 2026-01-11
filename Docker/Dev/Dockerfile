# ============================================
# SEN Frontend - Dockerfile (Development)
# Hot-reload enabled with Vite
# Optimized with layer caching
# ============================================

FROM node:20-alpine

WORKDIR /app

# Copy package files FIRST (cached if unchanged)
COPY package*.json ./

# Install dependencies (cached if package.json unchanged)
RUN npm install

# Copy source code LAST (this changes often)
COPY . .

# Expose Vite dev server port
EXPOSE 3001

# Start Vite dev server with host binding
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
