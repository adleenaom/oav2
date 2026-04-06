FROM python:3.11-slim

# Install Node.js + nginx + git
RUN apt-get update && apt-get install -y git nginx curl && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Clone repo
RUN git clone https://github.com/adleenaom/oav2.git /build/repo

# ---- Build React app ----
WORKDIR /build/repo/app
RUN npm ci
ENV VITE_API_URL=/api
RUN npm run build

# Copy built app to nginx
RUN cp -r /build/repo/app/dist/* /var/www/html/

# ---- Setup Python API ----
WORKDIR /app
RUN cp -r /build/repo/api/* /app/ && rm -rf /build

RUN pip install --no-cache-dir -r requirements.txt
RUN mkdir -p /app/data

# Nginx config: serve React on port 80, proxy /api to uvicorn on 8000
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /var/www/html; \
    index index.html; \
    location / { try_files $uri $uri/ /index.html; } \
    location /api/ { proxy_pass http://127.0.0.1:8000/; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; } \
    location /auth/ { proxy_pass http://127.0.0.1:8000/auth/; proxy_set_header Host $host; } \
    location /listings/ { proxy_pass http://127.0.0.1:8000/listings/; proxy_set_header Host $host; } \
    location /bundles { proxy_pass http://127.0.0.1:8000/bundles; proxy_set_header Host $host; } \
    location /plans { proxy_pass http://127.0.0.1:8000/plans; proxy_set_header Host $host; } \
    location /daily-videos { proxy_pass http://127.0.0.1:8000/daily-videos; proxy_set_header Host $host; } \
    location /credits { proxy_pass http://127.0.0.1:8000/credits; proxy_set_header Host $host; } \
    location /progress { proxy_pass http://127.0.0.1:8000/progress; proxy_set_header Host $host; } \
    location /search { proxy_pass http://127.0.0.1:8000/search; proxy_set_header Host $host; } \
    location /creators { proxy_pass http://127.0.0.1:8000/creators; proxy_set_header Host $host; } \
    location /health { proxy_pass http://127.0.0.1:8000/health; } \
    location /docs { proxy_pass http://127.0.0.1:8000/docs; } \
    location /openapi.json { proxy_pass http://127.0.0.1:8000/openapi.json; } \
}' > /etc/nginx/sites-available/default

# Start script: seed DB + start API + start nginx
RUN echo '#!/bin/bash\nDATABASE_URL=sqlite:///./data/openacademy.db python seed.py 2>/dev/null\nDATABASE_URL=sqlite:///./data/openacademy.db uvicorn main:app --host 127.0.0.1 --port 8000 &\nnginx -g "daemon off;"' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 80

CMD ["/app/start.sh"]
