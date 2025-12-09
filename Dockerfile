# -------- Builder stage --------
FROM node:18-alpine AS builder

WORKDIR /app

# Install system dependencies needed by Prisma
RUN apk add --no-cache openssl

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# -------- Runtime stage --------
FROM node:18-alpine

WORKDIR /app

# Install system dependencies needed by Prisma
RUN apk add --no-cache openssl

# Copy everything from builder
COPY --from=builder /app ./

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "src/app.js"]

