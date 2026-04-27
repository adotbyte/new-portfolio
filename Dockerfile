# --- Build Stage ---
FROM node:22-slim AS builder
WORKDIR /app

# ✅ Suppress npm update notice
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files first for layer caching
COPY frontend/package*.json ./
RUN npm ci

# Copy source
COPY frontend/ ./

# Build args for public env vars
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY

ARG FB_APP_ID
ENV FB_APP_ID=$FB_APP_ID

ARG ANTHROPIC_API_KEY
ENV ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY

# Build Next.js
RUN npx prisma generate
RUN npm run build

# --- Production Stage ---
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y curl openssl && rm -rf /var/lib/apt/lists/*

# ✅ Install curl for health check
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN addgroup --system app && adduser --system --group app

# Copy only what Next.js needs to run
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership
RUN chown -R app:app /app
USER app

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]