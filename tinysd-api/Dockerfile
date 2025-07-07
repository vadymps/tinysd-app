FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]