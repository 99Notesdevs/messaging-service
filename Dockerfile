FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies (no TypeScript, no ts-node)
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev --ignore-scripts

# Copy pre-compiled JavaScript
COPY dist ./dist

# Copy other necessary files (if any)
COPY . .

# Rebuild native modules if needed
RUN npm rebuild || true

# Expose server port
EXPOSE 4000

# Start the server with compiled code
CMD ["npm", "run", "start"]
