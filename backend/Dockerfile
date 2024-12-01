FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies, including dev dependencies
RUN npm install

# Install ts-node globally
RUN npm install -g ts-node

# Copy the rest of your application code
COPY . .

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Set environment variables with placeholder values
ENV DB_HOST=placeholder
ENV DB_PORT=5432
ENV DB_USER=placeholder
ENV DB_PASSWORD=placeholder
ENV DB_DATABASE=placeholder

# Start the application
CMD ["npm", "start"]

