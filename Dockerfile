# Use stable Node.js image (more stable than current-alpine)
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with flags to avoid QEMU crashes
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev --ignore-scripts

# Copy the entire app
COPY . .

# Build the TypeScript app
RUN npm run build

# Rebuild native modules if needed
RUN npm rebuild || true

# Expose server port
EXPOSE 4000

# Start the server
CMD ["npm", "run", "dev"]
