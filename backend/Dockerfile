FROM node:22-slim AS build

WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate


FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --omit=optional

COPY . .
COPY --from=build /app/generated ./generated

ENV NODE_ENV=production
EXPOSE 5000
USER node

CMD ["node", "--experimental-strip-types", "server.js"]
