FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build && npm install -g serve

EXPOSE 5173 3001

CMD ["sh", "-c", "node server/server.js & serve -s dist -l 5173"]
