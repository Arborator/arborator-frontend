# Use an official Node runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Install the application dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Bundle the application source inside the Docker image
COPY . .

# Expose port 8080
EXPOSE 8080

# Run the application
CMD ["npm", "start"]
