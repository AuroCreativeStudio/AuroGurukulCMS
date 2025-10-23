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
RUN npm install  # install all dependencies so 'strapi' CLI is available

EXPOSE 8080

# Start Strapi using shell to expand $PORT
CMD ["sh", "-c", "npx strapi start --no-telemetry --host 0.0.0.0 --port $PORT"]
