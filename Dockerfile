FROM node:20-alpine AS base
FROM base as deps
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . . 
ENV NEXT_TELEMETRY_DISABLED 1
ENV OPENAI_API_KEY myopenaiapikey
ENV PINECONE_API_KEY mypineconeapikey
ENV PINECONE_ENVIRONMENT gcp_starter
RUN npx prisma generate
RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV DATABASE_URL "postgres://postgres:postgres@db:5432/appdb?sslmode=disable"
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --chown=nextjs:nodejs prisma ./prisma/               
COPY --chown=nextjs:nodejs docker-bootstrap-app.sh ./
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["./docker-bootstrap-app.sh"]