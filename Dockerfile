FROM oven/bun:1.3.12

WORKDIR /usr/src/app

COPY package*.json bun.lock ./
RUN bun install --production
COPY . .

ENV NODE_ENV production

CMD ["bun", "src/index.ts"]