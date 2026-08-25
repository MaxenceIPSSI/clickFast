FROM node:24.19.0-alpine3.24 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY src ./src

RUN npm prune --omit=dev \
 && find node_modules -maxdepth 1 -type d -empty -delete

FROM node:24.19.0-alpine3.24

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY package.json ./

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "require('http').get('http://127.0.0.1:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "src/server.js"]
