# Multi-stage build for Node.js TypeScript application
FROM node:18-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /usr/src/app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS dev
ENV NODE_ENV=development
RUN npm ci --include=dev
COPY . .
EXPOSE 3001
USER nextjs
CMD ["dumb-init", "npm", "run", "dev"]

# Build stage
FROM base AS build
ENV NODE_ENV=development
RUN npm ci --include=dev
COPY . .

# Install TypeScript globally and build the application
RUN npm install -g typescript tsx
RUN npm run build || npx tsc --outDir dist src/**/*.ts

# Production dependencies stage
FROM base AS production-deps
ENV NODE_ENV=production
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine AS production
ENV NODE_ENV=production

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /usr/src/app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy production dependencies
COPY --from=production-deps --chown=nextjs:nodejs /usr/src/app/node_modules ./node_modules

# Copy built application
COPY --from=build --chown=nextjs:nodejs /usr/src/app/dist ./dist

# Copy necessary files
COPY --chown=nextjs:nodejs package*.json ./
COPY --chown=nextjs:nodejs src/db ./src/db

# Create logs directory
RUN mkdir -p logs && chown nextjs:nodejs logs

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').request('http://localhost:3001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).end()"

# Start the application
CMD ["dumb-init", "node", "dist/server.js"]