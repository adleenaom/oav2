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

    resolver 8.8.8.8 8.8.4.4 valid=30s ipv6=off;
    resolver_timeout 5s;

    set $backend https://app.theopenacademy.org;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /v3/ {
        rewrite ^/v3/(.*)$ /api/v3/$1 break;
        proxy_pass $backend;
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
        rewrite ^/auth/(.*)$ /api/auth/$1 break;
        proxy_pass $backend;
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
        rewrite ^/guest/(.*)$ /api/guest/$1 break;
        proxy_pass $backend;
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
        rewrite ^/media/(.*)$ /media/$1 break;
        proxy_pass $backend;
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
