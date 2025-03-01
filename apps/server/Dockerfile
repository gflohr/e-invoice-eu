# Stage 1: Build stage
FROM alpine:latest AS builder

ENV NODE_ENV=production
ENV LIBREOFFICE=libreoffice

RUN apk add --no-cache \
	bash \
	curl \
	npm \
	libc6-compat

RUN curl -fsSL https://bun.sh/install | bash && \
	ln -s /root/.bun/bin/bun /usr/local/bin/bun

WORKDIR /app

COPY . .

# Avoid "/bin/bash: line 1: husky: command not found"!
RUN grep -v 'prepare.*husky' package.json >package-tmp.json
RUN mv package-tmp.json package.json

# Give the installation two tries because of various issues.
RUN bun install || true
RUN bun install

# Stage 2: Runtime stage
FROM alpine:latest

ENV NODE_ENV=production
ENV LIBREOFFICE=libreoffice

# We need the openjdk only to suppress an ugly warning from LibreOffice.
# Also, newer versions like openjdk21-jre-headless do not shut up the
# warning.
RUN apk add --no-cache \
	bash \
	curl \
	libreoffice \
	openjdk8-jre \
	ttf-freefont \
	font-noto \
	font-noto-cjk \
	font-noto-emoji

WORKDIR /app
COPY --from=builder /app /app

# Copy the bun binary from the build stage to runtime
COPY --from=builder /root/.bun /root/.bun
RUN ln -s /root/.bun/bin/bun /usr/local/bin/bun

RUN echo "export LIBREOFFICE=\${LIBREOFFICE:-libreoffice}" >> /etc/profile.d/libreoffice.sh

EXPOSE 3000

CMD ["bun", "run", "start"]
