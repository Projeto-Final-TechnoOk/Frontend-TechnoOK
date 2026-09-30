FROM node:24

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

CMD ["sh", "-c", "npm run build && rm -rf /output/* && cp -a dist/frontend/browser/. /output/"]