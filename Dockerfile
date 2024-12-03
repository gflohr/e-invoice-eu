FROM alpine:latest

ENV NODE_ENV=production
ENV LIBREOFFICE=libreoffice

RUN apk add --no-cache \
	bash \
	curl \
	libreoffice \
	libc6-compat \
	npm \
	ttf-freefont \
	font-noto \
	font-noto-cjk \
	font-noto-emoji

RUN curl -fsSL https://bun.sh/install | bash && \
	ln -s /root/.bun/bin/bun /usr/local/bin/bun

WORKDIR /app

COPY . .

# Avoid "/bin/bash: line 1: husky: command not found"!
RUN bun install husky

RUN bun install --production

RUN echo "export LIBREOFFICE=\${LIBREOFFICE:-libreoffice}" >> /etc/profile.d/libreoffice.sh

EXPOSE 3000

CMD ["bun", "run", "start"]
