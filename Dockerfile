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
EXPOSE 8080
# Use Cloud Run PORT variable dynamically
CMD ["sh", "-c", "strapi start --host 0.0.0.0 --port ${PORT}"]
