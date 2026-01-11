# ============================================
# SEN Frontend - Dockerfile
# React + Vite Application
# ============================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci && npm cache clean --force

# ============================================
# Stage 2: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set build-time environment variables
ARG VITE_API_BASE_URL=http://localhost:3000/api
ARG VITE_API_TIMEOUT=30000

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_TIMEOUT=$VITE_API_TIMEOUT

# Build the application
RUN npm run build

# ============================================
# Stage 3: Production with Nginx
# ============================================
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nginx-sen && \
    adduser -S senfrontend -u 1001 -G nginx-sen && \
    chown -R senfrontend:nginx-sen /var/cache/nginx && \
    chown -R senfrontend:nginx-sen /var/log/nginx && \
    chown -R senfrontend:nginx-sen /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R senfrontend:nginx-sen /var/run/nginx.pid

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
