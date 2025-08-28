# ----------------------------
# Stage: base
# ----------------------------
  FROM node:20 AS base
  WORKDIR /usr/src/app
  COPY package*.json ./
  RUN npm install

  # Copy all source
  COPY . .
  
  # ----------------------------
  # Stage: dev
  # ----------------------------
  FROM base AS dev
  ENV NODE_ENV=development

  # Run by TS
  CMD ["npm", "run", "dev"]
  
  # ----------------------------
  # Stage: test
  # ----------------------------
  FROM base AS test
  ENV NODE_ENV=test
  
  # Run test
  CMD ["npm", "run", "test"]
  
  # ----------------------------
  # Stage: build
  # ----------------------------
  FROM base AS build
  ENV NODE_ENV=production

  RUN npm run build
  
  # =========================
# Production Stage
# =========================
FROM node:20-slim AS production
WORKDIR /usr/src/app

# Copy package files để cài deps production
COPY package*.json ./
RUN npm install --omit=dev

# Copy dist/ từ stage build
COPY --from=build /usr/src/app/dist ./dist

# Mặc định chạy app
CMD ["node", "dist/server.js"]