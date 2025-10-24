# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
COPY --from=builder /app ./

RUN npm install --omit=dev  # install only production deps

EXPOSE 8080

# Cloud Run auto-sets PORT env var, use it
CMD ["node", "node_modules/@strapi/strapi/bin/strapi.js", "start"]
