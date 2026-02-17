# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files e instalar dependências
COPY package.json package-lock.json* ./
RUN npm ci

# Copiar prisma schema e gerar client
COPY prisma ./prisma
RUN npx prisma generate

# Copiar código e buildar
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copiar prisma schema e gerar client de produção
COPY prisma ./prisma
RUN npx prisma generate

# Copiar build do stage anterior
COPY --from=builder /app/dist ./dist

EXPOSE 3002

# Script de entrypoint: aplica schema no banco e inicia a API
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/main"]
