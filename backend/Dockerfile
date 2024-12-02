# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Set default environment variables
ENV PORT=4000
ENV DB_HOST=localhost
ENV DB_PORT=5432
ENV DB_USERNAME=postgres
ENV DB_PASSWORD=postgres
ENV DB_DATABASE=transactions
ENV RABBITMQ_URL=amqp://localhost:5672
ENV JWT_SECRET=your_jwt_secret
ENV DB_SSL_CERT=placeholder
# Expose the port your app runs on
EXPOSE 4000

# Start the application
CMD ["npm", "run", "start:prod"]