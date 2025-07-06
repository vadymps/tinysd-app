# Stage 1: Build the Angular app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build-ui:production

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine
COPY --from=build /dist/apps/tinycd-ui/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
