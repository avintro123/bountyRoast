# ==============================================================================
# STAGE 1: Base Alpine Image
# ==============================================================================
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ==============================================================================
# STAGE 2: Install Dependencies
# ==============================================================================
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ==============================================================================
# STAGE 3: Build Next.js Production Bundle
# ==============================================================================
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy environment variables so Next.js static page generation compiles cleanly
ENV NEXT_PUBLIC_SUPABASE_URL=https://dummy-docker-project.supabase.co
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=dummy-docker-anon-key
ENV STRIPE_SECRET_KEY=sk_test_dummy_docker_key
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ==============================================================================
# STAGE 4: Production Runner (Ultra-minimal & secure)
# ==============================================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Security Best Practice: Don't run as root! Create a dedicated non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and pre-traced standalone bundle from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-privileged user
USER nextjs

EXPOSE 3000

# Start Next.js standalone server
CMD ["node", "server.js"]
