# Use an official Node runtime as a parent image
FROM node:16-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Bundle the application source inside the Docker image
COPY . .

# Expose port 8080
EXPOSE 8080

# Run the application
CMD ["npm", "start"]
