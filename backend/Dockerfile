FROM node:20-bullseye-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y openssl libssl1.1 ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y openssl libssl1.1 ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate

EXPOSE 3001
CMD ["node", "dist/src/main.js"]
