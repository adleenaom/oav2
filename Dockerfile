FROM node:22-alpine AS build

WORKDIR /app

# Copy app source directly (no git clone — Coolify checks out the repo)
COPY app/package.json app/package-lock.json ./
RUN npm install

COPY app/ ./

ENV VITE_API_URL=
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    client_max_body_size 10m;\n\
    location / { try_files $uri $uri/ /index.html; }\n\
    location /assets/ { expires 1y; add_header Cache-Control "public, immutable"; }\n\
    location /api/ {\n\
        proxy_pass https://app.theopenacademy.org/api/;\n\
        proxy_set_header Host app.theopenacademy.org;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
        proxy_ssl_server_name on;\n\
        proxy_pass_request_headers on;\n\
    }\n\
    location /auth/ {\n\
        proxy_pass https://app.theopenacademy.org/api/auth/;\n\
        proxy_set_header Host app.theopenacademy.org;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
        proxy_ssl_server_name on;\n\
        proxy_pass_request_headers on;\n\
    }\n\
    location /guest/ {\n\
        proxy_pass https://app.theopenacademy.org/api/guest/;\n\
        proxy_set_header Host app.theopenacademy.org;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
        proxy_ssl_server_name on;\n\
        proxy_pass_request_headers on;\n\
    }\n\
    location /v3/ {\n\
        proxy_pass https://app.theopenacademy.org/api/v3/;\n\
        proxy_set_header Host app.theopenacademy.org;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
        proxy_ssl_server_name on;\n\
        proxy_pass_request_headers on;\n\
    }\n\
    location /media/ {\n\
        proxy_pass https://app.theopenacademy.org/media/;\n\
        proxy_set_header Host app.theopenacademy.org;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
        proxy_ssl_server_name on;\n\
        proxy_pass_request_headers on;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
