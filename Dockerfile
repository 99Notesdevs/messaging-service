FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev --ignore-scripts

# Copy pre-compiled dist folder
COPY dist ./dist

# IMPORTANT: Copy proto files to dist if they're needed at runtime
COPY grpc/proto ./dist/grpc/proto

COPY . .
RUN npm rebuild || true

EXPOSE 4000

CMD ["npm", "run", "start"]
