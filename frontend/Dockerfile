FROM node:18-alpine

WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies with network timeout instead of frozen lockfile
RUN yarn install --network-timeout 600000

# Copy application code
COPY . .

# Build the application
RUN yarn build

# Command to run the application
CMD ["yarn", "start"]
