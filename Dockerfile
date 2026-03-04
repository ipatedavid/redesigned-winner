FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY HTML/package*.json ./

# Install dependencies
RUN npm install

# Copy your server code
COPY HTML/server.js .

# Copy your HTML/CSS/JS frontend
COPY HTML/ ./HTML/

EXPOSE 3000

CMD ["node", "server.js"]
