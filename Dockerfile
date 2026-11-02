# --- Build Stage ---
FROM node:22.22.3-slim AS builder
WORKDIR /app

# ✅ Suppress npm update notice
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files first for layer caching
COPY frontend/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit

# Copy source (includes scripts/, messages/, public/)
COPY frontend/ ./

ARG ANTHROPIC_API_KEY
ENV ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY

# Run translation
RUN node scripts/translate.mjs || (echo "TRANSLATION FAILED" && exit 1)

# Build args for public env vars
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY

ARG FB_APP_ID
ENV FB_APP_ID=$FB_APP_ID

# Build Next.js (Prisma + Next.js)
RUN npx prisma generate && npx prisma generate --schema=prisma-homelab/schema.prisma
RUN npm run build

# --- Production Stage ---
FROM node:22.22.3-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get upgrade -y && apt-get install -y curl openssl && rm -rf /var/lib/apt/lists/*

RUN addgroup --system app && adduser --system --group app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R app:app /app
USER app

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]