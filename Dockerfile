FROM node:22-alpine
RUN npm install -g pnpm@9
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]
