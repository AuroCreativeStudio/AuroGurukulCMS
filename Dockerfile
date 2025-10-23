FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT 8080
COPY --from=builder /app ./
EXPOSE 8080
CMD ["sh", "-c", "HOST=0.0.0.0 PORT=${PORT} npm start"]
