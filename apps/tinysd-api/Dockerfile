# Stage 1: Build the app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build-api:production

# Stage 2: Run the built app
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist/apps/tinysd-api ./dist
EXPOSE 3000
CMD ["node", "dist/main"]