# # ---------- Base Stage ----------
#   FROM node:18-alpine AS base

#   # Install dumb-init for proper signal handling
#   RUN apk add --no-cache dumb-init
  
#   # Create app directory
#   WORKDIR /usr/src/app
  
#   # Create non-root user
#   RUN addgroup -g 1001 -S nodejs && \
#       adduser -S nextjs -u 1001 -G nodejs
  
#   # Copy package files
#   COPY package*.json ./
  
#   # ---------- Development Stage ----------
#   FROM base AS dev
#   ENV NODE_ENV=development
  
#   # Install all dependencies (including dev)
#   RUN npm ci --include=dev
  
#   # Copy source code
#   COPY . .
  
#   # Create logs directory and set permissions (still root here)
#   RUN mkdir -p /usr/src/app/logs && \
#       chown -R nextjs:nodejs /usr/src/app
  
#   # Switch to non-root user
#   USER nextjs
  
#   EXPOSE 3001
  
#   CMD ["dumb-init", "npm", "run", "dev"]
  
#   # ---------- Build Stage ----------
#   FROM base AS build
#   ENV NODE_ENV=development
  
#   RUN npm ci --include=dev
#   COPY . .
  
#   # Install TypeScript + build
#   RUN npm install -g typescript tsx && \
#       npm run build || npx tsc --outDir dist src/**/*.ts
  
#   # ---------- Production Dependencies Stage ----------
#   FROM base AS production-deps
#   ENV NODE_ENV=production
  
#   RUN npm ci --only=production && npm cache clean --force
  
#   # ---------- Production Stage ----------
#   FROM node:18-alpine AS production
#   ENV NODE_ENV=production
  
#   # Install dumb-init
#   RUN apk add --no-cache dumb-init
  
#   WORKDIR /usr/src/app
  
#   # Create non-root user
#   RUN addgroup -g 1001 -S nodejs && \
#       adduser -S nextjs -u 1001 -G nodejs
  
#   # Copy production dependencies
#   COPY --from=production-deps --chown=nextjs:nodejs /usr/src/app/node_modules ./node_modules
  
#   # Copy built application
#   COPY --from=build --chown=nextjs:nodejs /usr/src/app/dist ./dist
  
#   # Copy necessary files (db migrations/configs)
#   COPY --chown=nextjs:nodejs package*.json ./
#   COPY --chown=nextjs:nodejs src/db ./src/db
  
#   # Create logs directory
#   RUN mkdir -p logs && chown -R nextjs:nodejs logs
  
#   # Switch to non-root user
#   USER nextjs
  
#   EXPOSE 3001
  
#   # Health check
#   HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#     CMD node -e "require('http').request('http://localhost:3001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).end()"
  
#   # Start application
#   CMD ["dumb-init", "node", "dist/server.js"]
  
# ARG NODE_VERSION=20.0.0

# FROM node:${NODE_VERSION}-alpine as base
# WORKDIR /usr/src/app
# EXPOSE 3001

# # Copy package.json
# COPY package*.json ./

# RUN chown -R node:node /usr/src/app

# FROM base as dev
# # RUN --mount=type=bind,source=package.json,target=package.json \
# # --mount=type=bind,source=package-lock.json,target=package-lock.json \
# # --mount=type=cache,target=/root/.npm \
# # npm ci --include=dev
# USER node

# # install dependencies
# RUN npm ci

# # Copy code resource
# COPY --chown=node:node

# CMD npm run dev

# FROM node:${NODE_VERSION}-alpine as prod
# RUN --mount=type=bind,source=package.json,target=package.json \
#     --mount=type=bind,source=package-lock.json,target=package-lock.json \
#     --mount=type=cache,target=/root/.npm \
#     npm ci --omit=dev

# USER node
# COPY . .
# # Start application
# CMD ["dumb-init", "node", "dist/server.js"]

# Stage: base
FROM node:20 AS base
WORKDIR /usr/src/app

# copy package.json to install
COPY package*.json ./

RUN chown -R node:node /usr/src/app

# Stage: development
FROM base AS dev
USER node

RUN npm ci

COPY --chown=node:node . .

CMD ["npm", "run", "dev"]

# Stage: test
FROM base AS test
ENV NODE_ENV=test

RUN npm ci --include=dev
COPY --chown=node:node . .

CMD ["npm", "test"]
