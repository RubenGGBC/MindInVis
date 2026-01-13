# ================================
# Stage 1: Build Frontend
# ================================
FROM node:18-alpine AS client-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies
RUN npm ci

# Copy client source
COPY client/ ./

# Build client
RUN npm run build

# ================================
# Stage 2: Production
# ================================
FROM node:18-alpine

WORKDIR /app

# Install production dependencies
RUN apk add --no-cache tini

# Copy root package files
COPY package*.json ./

# Copy server package files
COPY server/package*.json ./server/

# Copy shared code
COPY shared ./shared

# Install server dependencies (production only)
RUN cd server && npm ci --omit=dev

# Copy server source code
COPY server/src ./server/src

# Copy built client from builder stage
COPY --from=client-builder /app/client/dist ./client/dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose ports
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start server
CMD ["node", "server/src/index.js"]
