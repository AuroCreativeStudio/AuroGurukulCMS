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
ENV PORT=8080
COPY --from=builder /app ./
RUN npm ci --only=production
RUN apk add --no-cache bash curl

EXPOSE 8080
CMD ["sh", "-c", "strapi start --host 0.0.0.0 --port ${PORT}"]
