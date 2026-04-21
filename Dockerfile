FROM node:22-alpine AS build

RUN apk add --no-cache git

WORKDIR /app

RUN git clone https://github.com/adleenaom/oav2.git /tmp/repo

RUN cp -r /tmp/repo/app/. /app/ && rm -rf /tmp/repo

RUN npm install

ENV VITE_API_URL=
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / { try_files $uri $uri/ /index.html; }\n\
    location /assets/ { expires 1y; add_header Cache-Control "public, immutable"; }\n\
    location /api/ { proxy_pass https://app.theopenacademy.org/api/; proxy_set_header Host app.theopenacademy.org; proxy_ssl_server_name on; }\n\
    location /auth/ { proxy_pass https://app.theopenacademy.org/api/auth/; proxy_set_header Host app.theopenacademy.org; proxy_ssl_server_name on; }\n\
    location /guest/ { proxy_pass https://app.theopenacademy.org/api/guest/; proxy_set_header Host app.theopenacademy.org; proxy_ssl_server_name on; }\n\
    location /v3/ { proxy_pass https://app.theopenacademy.org/api/v3/; proxy_set_header Host app.theopenacademy.org; proxy_ssl_server_name on; }\n\
    location /media/ { proxy_pass https://app.theopenacademy.org/media/; proxy_set_header Host app.theopenacademy.org; proxy_ssl_server_name on; }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
