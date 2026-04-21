FROM node:22-alpine AS build

WORKDIR /app

COPY app/package.json app/package-lock.json ./
RUN npm install

COPY app/ ./

ENV VITE_API_URL=
RUN npm run build

FROM nginx:alpine

RUN apk add --no-cache ca-certificates

COPY --from=build /app/dist /usr/share/nginx/html

RUN cat > /etc/nginx/conf.d/default.conf << 'NGINXEOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    client_max_body_size 10m;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static asset caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy — static proxy_pass with URI does automatic path rewriting:
    # /v3/listings/learn → https://app.theopenacademy.org/api/v3/listings/learn
    location /v3/ {
        proxy_pass https://app.theopenacademy.org/api/v3/;
        proxy_set_header Host app.theopenacademy.org;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_ssl_server_name on;
        proxy_ssl_protocols TLSv1.2 TLSv1.3;
        proxy_redirect off;
    }

    location /auth/ {
        proxy_pass https://app.theopenacademy.org/api/auth/;
        proxy_set_header Host app.theopenacademy.org;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_ssl_server_name on;
        proxy_ssl_protocols TLSv1.2 TLSv1.3;
        proxy_redirect off;
    }

    location /guest/ {
        proxy_pass https://app.theopenacademy.org/api/guest/;
        proxy_set_header Host app.theopenacademy.org;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_ssl_server_name on;
        proxy_ssl_protocols TLSv1.2 TLSv1.3;
        proxy_redirect off;
    }

    location /media/ {
        proxy_pass https://app.theopenacademy.org/media/;
        proxy_set_header Host app.theopenacademy.org;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_ssl_server_name on;
        proxy_ssl_protocols TLSv1.2 TLSv1.3;
        proxy_redirect off;
    }
}
NGINXEOF

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
