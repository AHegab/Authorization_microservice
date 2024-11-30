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
ENV DB_HOST=placeholder
ENV DB_PORT=20615
ENV DB_USER=placeholder
ENV DB_PASSWORD=placeholder
ENV DB_DATABASE=placeholder

# Command to run the application
CMD ["npm", "run", "start:prod"]