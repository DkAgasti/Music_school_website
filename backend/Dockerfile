FROM node:20-alpine

WORKDIR /app

# OpenSSL Prisma engine ke liye Alpine me required hota hai
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

# Production dependencies install karo
RUN npm ci

# Prisma Client generate karo (Linux architecture ke liye)
RUN npx prisma generate

COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]