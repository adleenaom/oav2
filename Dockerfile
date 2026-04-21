FROM node:22-alpine AS build

WORKDIR /app

# Cache bust: this ARG changes with every commit, forcing rebuild
ARG CACHEBUST=1

COPY app/package.json app/package-lock.json ./
RUN npm install

COPY app/ ./

ENV VITE_API_URL=
RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY server.js ./

EXPOSE 80
CMD ["node", "server.js"]
