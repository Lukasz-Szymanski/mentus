FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build Next.js
RUN npm run build

# Cloud Run uses the PORT environment variable
ENV PORT=8080
EXPOSE 8080

# Start the custom server
CMD ["npx", "tsx", "server.ts"]
