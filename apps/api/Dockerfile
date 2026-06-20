# Build stage
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace root config for dependency resolution
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy package manifests (for layer caching)
COPY packages/schemas/package.json packages/types/package.json ./packages/
COPY apps/api/package.json apps/api/

# Install all dependencies (including dev)
RUN pnpm install --frozen-lockfile

# Copy workspace package sources
COPY packages/schemas/ packages/schemas/
COPY packages/types/ packages/types/

# Re-link workspace packages after source copy (avoids stale symlinks)
RUN pnpm install --frozen-lockfile

# Build workspace packages
RUN pnpm --filter @hms/schemas build && \
    pnpm --filter @hms/types build

# Copy API source and build
COPY apps/api/ apps/api/
RUN cd apps/api && pnpm run build

# Production stage
FROM node:20-alpine AS production

RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy workspace root config
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy package manifests for production install (each to its own directory)
COPY packages/schemas/package.json packages/schemas/
COPY packages/types/package.json packages/types/
COPY apps/api/package.json apps/api/
COPY apps/api/prisma.config.ts apps/api/
COPY apps/api/prisma/ apps/api/prisma/

# Install production dependencies
# --ignore-scripts avoids husky prepare (no .git in Docker)
RUN pnpm install --frozen-lockfile --prod --ignore-scripts && pnpm rebuild

# Copy compiled API output (includes bundled workspace packages)
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Regenerate Prisma client AFTER copying source (overwrites old generated files)
RUN cd apps/api && pnpm exec prisma generate

# Create logs directory and set ownership of writable paths only
RUN mkdir -p apps/api/logs && chown -R nodejs:nodejs apps/api/logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Run pending migrations, then start the server
CMD cd apps/api && pnpm exec prisma migrate deploy && node dist/server.js
