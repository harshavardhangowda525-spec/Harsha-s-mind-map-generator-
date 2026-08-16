# MindMap — full app (frontend + auth API) in one container.
FROM node:20-slim

WORKDIR /app

# Install production dependencies first (better layer caching).
COPY package*.json ./
RUN npm install --omit=dev

# App source
COPY . .

# The SQLite database lives here — mount a volume at /app/data to persist it.
ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_FILE=/app/data/mindmap.db
VOLUME ["/app/data"]

EXPOSE 3000
CMD ["npm", "start"]
