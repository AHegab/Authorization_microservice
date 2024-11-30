FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies including dev dependencies for build
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Clean up dev dependencies
RUN npm ci --only=production

# Expose port 3000
EXPOSE 3000

# Set environment variables with placeholder values
ENV DB_HOST=auth-service-auth-service-personalfianancetracker.j.aivencloud.com
ENV DB_PORT=20615
ENV DB_USER=avnadmin
ENV DB_PASSWORD=AVNS_zB6wwRC6-H4XkEiB4w8
ENV DB_DATABASE=users

# Command to run the application
CMD ["npm", "run", "start:prod"]