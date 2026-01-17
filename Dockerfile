FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev deps for TypeScript build)
RUN npm ci --ignore-scripts || npm install --ignore-scripts

# Copy the entire app
COPY . .

# Build the TypeScript app (tsc is now available)
RUN npm run build

# Rebuild native modules if needed
RUN npm rebuild || true

# Expose server port
EXPOSE 4000

# Start the server
CMD ["npm", "run", "dev"]
