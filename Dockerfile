# Stage 1
FROM node:node:20-alpine3.19 as build

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all the files
COPY . .

RUN npm run build

# Stage 2: Serving webiste using Nginx
FROM nginx:1.27.0-alpine

# Copy the built app to the Nginx server
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]