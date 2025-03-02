FROM node:23.0-alpine AS base

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install

FROM base AS final

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]