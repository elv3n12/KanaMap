FROM node:22-alpine AS deps
WORKDIR /app/apps/web
COPY apps/web/package*.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_MAPTILER_KEY
ENV NEXT_PUBLIC_MAPTILER_KEY=$NEXT_PUBLIC_MAPTILER_KEY
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY apps/web ./apps/web
COPY prisma ./prisma
WORKDIR /app/apps/web
RUN npm run db:generate
RUN if [ -d /app/node_modules/.prisma/client ]; then mkdir -p /app/apps/web/node_modules/.prisma && cp -R /app/node_modules/.prisma/client /app/apps/web/node_modules/.prisma/; fi
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web ./apps/web
COPY --from=builder /app/prisma ./prisma
WORKDIR /app/apps/web
RUN npm install --production=false tsx prisma
EXPOSE 3000
CMD ["sh", "-c", "npm run db:deploy && npm run db:seed && npm run start"]
