# Stage 1: Build stage
FROM alpine:latest AS builder

ENV NODE_ENV=production
ENV LIBREOFFICE=libreoffice

RUN apk add --no-cache \
	bash \
	curl \
	nodejs \
	npm \
	libc6-compat

RUN npm install -g pnpm@10

WORKDIR /app

COPY . .

RUN pnpm install --ignore-scripts && pnpm run build

# Stage 2: Runtime stage
FROM alpine:latest

ENV NODE_ENV=production
ENV LIBREOFFICE=libreoffice

# We need the openjdk only to suppress an ugly warning from LibreOffice.
# Also, newer versions like openjdk21-jre-headless do not shut up the
# warning.
RUN apk add --no-cache \
	nodejs \
	libreoffice \
	openjdk8-jre \
	ttf-freefont \
	font-noto \
	font-noto-cjk \
	font-noto-emoji

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules

RUN echo "export LIBREOFFICE=\${LIBREOFFICE:-libreoffice}" >> /etc/profile.d/libreoffice.sh

# Create a non-root user
RUN addgroup -S e-invoice-eu && adduser -S e-invoice-eu -G e-invoice-eu

USER e-invoice-eu

EXPOSE 3000

ENTRYPOINT ["node", "dist/main.js"]
