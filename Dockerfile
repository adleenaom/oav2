FROM node:22-alpine AS build

RUN apk add --no-cache git

WORKDIR /app

RUN git clone https://github.com/adleenaom/oav2.git /tmp/repo && cp -r /tmp/repo/app/* /app/ && cp -r /tmp/repo/app/.* /app/ 2>/dev/null; rm -rf /tmp/repo

RUN npm ci

ENV VITE_API_URL=
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { try_files $uri $uri/ /index.html; } \
    location /assets/ { expires 1y; add_header Cache-Control "public, immutable"; } \
    location /api/ { proxy_pass https://app.theopenacademy.org/api/; proxy_set_header Host app.theopenacademy.org; proxy_set_header X-Real-IP $remote_addr; proxy_set_header Accept "application/json"; proxy_ssl_server_name on; } \
    location /auth/ { proxy_pass https://app.theopenacademy.org/api/auth/; proxy_set_header Host app.theopenacademy.org; proxy_ssl_server_name on; } \
    location /guest/ { proxy_pass https://app.theopenacademy.org/api/guest/; proxy_set_header Host app.theopenacademy.org; proxy_ssl_server_name on; } \
    location /v3/ { proxy_pass https://app.theopenacademy.org/api/v3/; proxy_set_header Host app.theopenacademy.org; proxy_ssl_server_name on; } \
    location /media/ { proxy_pass https://app.theopenacademy.org/media/; proxy_set_header Host app.theopenacademy.org; proxy_ssl_server_name on; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
