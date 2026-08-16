# MindMap — full app (frontend + auth/admin API) in one container.
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# SQLite database location — mount a volume at /app/data to persist it.
ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_FILE=/app/data/mindmap.db \
    ADMIN_EMAIL=harshavardhangowda525@gmail.com
VOLUME ["/app/data"]

EXPOSE 3000
CMD ["npm", "start"]
