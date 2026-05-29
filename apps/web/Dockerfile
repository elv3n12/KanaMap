# Stage 1: Install all dependencies (for build)
FROM node:22-alpine AS deps
WORKDIR /app/apps/web
COPY apps/web/package*.json ./
RUN npm ci

# Stage 2: Install production dependencies only
FROM node:22-alpine AS prod-deps
WORKDIR /app/apps/web
COPY apps/web/package*.json ./
RUN npm ci --omit=dev
# Add only the runtime tools needed for db:deploy and db:seed
RUN npm install --no-save prisma tsx

# Stage 3: Build the application
FROM node:22-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_MAPTILER_KEY
ENV NEXT_PUBLIC_MAPTILER_KEY=$NEXT_PUBLIC_MAPTILER_KEY
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY apps/web ./apps/web
COPY prisma ./prisma
WORKDIR /app/apps/web
RUN npm run db:generate
RUN npm run build

# Stage 4: Production runner (slim)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy production node_modules (with prisma + tsx but no dev deps)
COPY --from=prod-deps /app/apps/web/node_modules ./apps/web/node_modules

# Copy built app and prisma schema
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/prisma ./prisma

# Copy generated Prisma client into prod node_modules
COPY --from=builder /app/apps/web/node_modules/.prisma ./apps/web/node_modules/.prisma

WORKDIR /app/apps/web
EXPOSE 3000
CMD ["sh", "-c", "npm run db:deploy && npm run db:seed && npm run start"]
