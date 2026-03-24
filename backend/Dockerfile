FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl python3 make g++ bash libc6-compat

COPY package*.json ./

RUN npm config set registry https://registry.npmmirror.com && npm ci --omit=dev --no-audit --no-fund

COPY . .

ENV NODE_ENV=production
ENV IS_DOCKER=true

RUN npx prisma generate

EXPOSE 5000

CMD ["node", "server.js"]