FROM node:24-alpine AS workspace-packages

WORKDIR /tmp/core

RUN corepack enable

COPY packages/core ./

RUN pnpm pack

FROM node:24-alpine AS builder

ENV CI=true
WORKDIR /app

RUN corepack enable

RUN apk add --no-cache git

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server ./apps/server

COPY --from=workspace-packages /tmp/core/*.tgz /tmp/core.tgz

RUN pnpm add /tmp/core.tgz
RUN pnpm install --frozen-lockfile --filter @e-invoice-eu/server...

RUN pnpm --filter @e-invoice-eu/server build
RUN pnpm --filter @e-invoice-eu/server deploy --legacy --prod /app/out

FROM node:24-alpine

ARG WITH_LIBREOFFICE=true
ENV NODE_ENV=production
ENV LIBREOFFICE=libreoffice

WORKDIR /app

RUN if [ "$WITH_LIBREOFFICE" = "true" ]; then \
		apk add --no-cache \
			libreoffice \
			openjdk8-jre \
			ttf-freefont \
			font-noto \
			font-noto-cjk \
			font-noto-emoji; \
	fi

RUN apk update && apk upgrade

COPY --from=builder /app/out .

RUN addgroup -S e-invoice-eu && adduser -S e-invoice-eu -G e-invoice-eu
USER e-invoice-eu

EXPOSE 3000

ENTRYPOINT ["node", "dist/main.js"]
