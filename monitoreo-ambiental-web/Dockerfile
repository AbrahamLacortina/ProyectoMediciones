# Etapa de build
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Etapa de producción
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80