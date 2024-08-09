# Stage 1
FROM node:20-alpine3.19 AS build

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all the files
COPY ./src ./src

# Stage 2: serving webiste using Nginx
FROM nginx:1.27.0-alpine

# Copy the built app to the Nginx server
COPY --from=build /app /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]