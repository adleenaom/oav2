FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create data directory for persistent volume
RUN mkdir -p /app/data

EXPOSE 8000

# Entrypoint: seed if DB doesn't exist, then start server
CMD ["sh", "-c", "if [ ! -f /app/data/openacademy.db ]; then DATABASE_URL=sqlite:///./data/openacademy.db python seed.py; fi && uvicorn main:app --host 0.0.0.0 --port 8000"]
