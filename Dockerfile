FROM node:22-slim
WORKDIR /app

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build && npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Mount persistent volumes here so content and uploads survive redeploys:
#   /app/data            -> site content
#   /app/public/uploads  -> uploaded photos and videos
CMD ["node", "server.js"]
