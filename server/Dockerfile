# ── Stage 1: Build ────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

# Install all deps (including devDeps needed for tsc + prisma generate)
RUN npm ci

# Generate Prisma client for the current platform
RUN npx prisma generate

COPY . .
RUN npm run build

# ── Stage 2: Production runtime ────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma

# Install production dependencies only
RUN npm ci --omit=dev

# Re-generate Prisma client in the clean prod image
RUN npx prisma generate

# Copy compiled JS from builder
COPY --from=builder /app/dist ./dist

EXPOSE 5001

CMD ["node", "dist/index.js"]
