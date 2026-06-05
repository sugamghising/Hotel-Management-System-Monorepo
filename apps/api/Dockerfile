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

# Copy API source (prisma schema, tsconfig, src, etc.) and build
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

# Copy package manifests for production install
COPY packages/schemas/package.json packages/types/package.json ./packages/
COPY apps/api/package.json apps/api/
COPY apps/api/tsconfig.json apps/api/

# Install production dependencies
# --ignore-scripts avoids husky prepare (no .git in Docker)
RUN pnpm install --frozen-lockfile --prod --ignore-scripts && pnpm rebuild

# Install tsx globally for path alias resolution at runtime
RUN npm install -g tsx

# Copy compiled API output
COPY --from=builder /app/apps/api/dist ./apps/api/dist
# Copy API source (tsx uses it to resolve @/ path aliases from compiled output)
COPY --from=builder /app/apps/api/src ./apps/api/src
# Copy built workspace packages for runtime resolution
COPY --from=builder /app/packages/schemas/dist ./packages/schemas/dist
COPY --from=builder /app/packages/types/dist ./packages/types/dist

# Create logs directory and set ownership
RUN mkdir -p logs && chown -R nodejs:nodejs .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# tsx resolves tsconfig path aliases from compiled output
CMD ["tsx", "apps/api/dist/server.js"]
