FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

FROM base AS builder

ARG VITE_REGISTRY_ADDRESS
ARG VITE_XRPL_NETWORK
ENV VITE_REGISTRY_ADDRESS=${VITE_REGISTRY_ADDRESS}
ENV VITE_XRPL_NETWORK=${VITE_XRPL_NETWORK}

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/services ./services
COPY --from=builder /app/types.ts ./types.ts
COPY --from=builder /app/constants.ts ./constants.ts

EXPOSE 3000

CMD ["bun", "run", "start"]
