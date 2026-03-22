FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl python3 make g++ bash

COPY package*.json ./

RUN npm install --omit=dev --no-audit --no-fund

COPY . .

ENV NODE_ENV=production

EXPOSE 5000

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && node server.js"]