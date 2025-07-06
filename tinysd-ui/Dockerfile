FROM nginx:1.25-alpine
COPY dist/tinysd-ui/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
