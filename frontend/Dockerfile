FROM node:23.0-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine AS deploy

COPY nginx/nginx.conf /etc/nginx/nginx.conf

COPY nginx/nginx.crt nginx/nginx.key /etc/nginx/certs/

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]