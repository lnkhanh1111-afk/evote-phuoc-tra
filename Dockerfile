# Build stage cho frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Cài đặt server dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --omit=dev

# Copy mã nguồn server và bản build tĩnh frontend
WORKDIR /app
COPY server/ ./server/
COPY --from=frontend-builder /app/client/dist ./client/dist

# Tạo thư mục lưu trữ dữ liệu database
RUN mkdir -p /app/server/data

VOLUME ["/app/server/data"]

EXPOSE 5000
ENV PORT=5000
ENV NODE_ENV=production

CMD ["node", "server/index.js"]
