FROM node:22-alpine AS build

WORKDIR /app

COPY app/package.json app/package-lock.json ./
RUN npm install

COPY app/ ./

ENV VITE_API_URL=
RUN npm run build

FROM nginx:alpine

# Install ca-certificates for HTTPS proxy
RUN apk add --no-cache ca-certificates

COPY --from=build /app/dist /usr/share/nginx/html

# Write nginx config with proper upstream proxy settings
RUN cat > /etc/nginx/conf.d/default.conf << 'NGINXEOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    client_max_body_size 10m;

    # DNS resolver for dynamic upstream resolution
    resolver 8.8.8.8 8.8.4.4 valid=30s ipv6=off;
    resolver_timeout 5s;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /v3/ {
        set $upstream https://app.theopenacademy.org;
        proxy_pass $upstream/api/v3/;
        proxy_set_header Host app.theopenacademy.org;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_ssl_server_name on;
        proxy_ssl_protocols TLSv1.2 TLSv1.3;
        proxy_pass_request_headers on;
        proxy_pass_request_body on;
    }

    location /auth/ {
        set $upstream https://app.theopenacademy.org;
        proxy_pass $upstream/api/auth/;
        proxy_set_header Host app.theopenacademy.org;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_ssl_server_name on;
        proxy_ssl_protocols TLSv1.2 TLSv1.3;
        proxy_pass_request_headers on;
        proxy_pass_request_body on;
    }

    location /guest/ {
        set $upstream https://app.theopenacademy.org;
        proxy_pass $upstream/api/guest/;
        proxy_set_header Host app.theopenacademy.org;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_ssl_server_name on;
        proxy_ssl_protocols TLSv1.2 TLSv1.3;
        proxy_pass_request_headers on;
        proxy_pass_request_body on;
    }

    location /media/ {
        set $upstream https://app.theopenacademy.org;
        proxy_pass $upstream/media/;
        proxy_set_header Host app.theopenacademy.org;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_ssl_server_name on;
        proxy_ssl_protocols TLSv1.2 TLSv1.3;
        proxy_pass_request_headers on;
        proxy_pass_request_body on;
    }
}
NGINXEOF

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
