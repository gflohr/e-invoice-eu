# Stage 1: Build
FROM node:24-alpine AS builder

ENV CI=true

WORKDIR /app

RUN corepack enable

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps ./apps

RUN apk add --no-cache git

RUN apk add --no-cache git

RUN pnpm fetch --filter @e-invoice-eu/server...

RUN pnpm install --offline --frozen-lockfile \
  --filter @e-invoice-eu/server...

RUN pnpm --filter @e-invoice-eu/server build

RUN pnpm --filter @e-invoice-eu/server deploy --legacy --prod /app/out

# Stage 2: Runtime
FROM node:24-alpine

ENV NODE_ENV=production

ARG WITH_LIBREOFFICE=true

ENV LIBREOFFICE=libreoffice

RUN if [ "$WITH_LIBREOFFICE" = "true" ]; then \
	apk add --no-cache \
		libreoffice \
		openjdk8-jre \
		ttf-freefont \
		font-noto \
		font-noto-cjk \
		font-noto-emoj; \
fi

RUN apk update && apk upgrade

WORKDIR /app

COPY --from=builder /app/out .

# Non-root user
RUN addgroup -S e-invoice-eu && adduser -S e-invoice-eu -G e-invoice-eu
USER e-invoice-eu

EXPOSE 3000

ENTRYPOINT ["node", "dist/main.js"]
