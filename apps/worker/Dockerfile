FROM node:22-alpine AS deps
WORKDIR /app/apps/worker
COPY apps/worker/package*.json ./
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/apps/worker/node_modules ./apps/worker/node_modules
COPY apps/worker ./apps/worker
COPY prisma ./prisma
WORKDIR /app/apps/worker
RUN npm run db:generate
RUN if [ -d /app/node_modules/.prisma/client ]; then mkdir -p /app/apps/worker/node_modules/.prisma && cp -R /app/node_modules/.prisma/client /app/apps/worker/node_modules/.prisma/; fi
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/worker ./apps/worker
COPY --from=builder /app/prisma ./prisma
WORKDIR /app/apps/worker
CMD ["npm", "run", "start"]
