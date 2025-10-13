FROM node:20-alpine AS deps
WORKDIR /app
# Works with package-lock.json or without it
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm i; fi

FROM node:20-alpine
WORKDIR /app
ENV HOST=0.0.0.0
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]