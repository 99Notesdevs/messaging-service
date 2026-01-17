FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev --ignore-scripts
COPY . .
RUN npm run build
RUN npm rebuild || true
EXPOSE 4000
CMD ["npm", "run", "dev"]
