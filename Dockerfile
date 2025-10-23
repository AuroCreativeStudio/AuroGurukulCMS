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
RUN npm install --production  # ensure dependencies are installed

EXPOSE 8080

# Use Cloud Run PORT automatically
CMD ["npx", "strapi", "start", "--no-telemetry", "--host", "0.0.0.0", "--port", "$PORT"]
