FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev --ignore-scripts

# Copy pre-compiled dist folder
COPY dist ./dist

# Copy proto files from src to dist
COPY src/grpc/proto ./dist/grpc/proto

COPY . .
RUN npm rebuild || true

EXPOSE 4000

CMD ["npm", "run", "start"]
