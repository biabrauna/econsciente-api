FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

# Compila o seed (sem path aliases, só @prisma/client — compila direto)
RUN npx tsc scripts/seed-desafios.ts scripts/seed-admin.ts \
    --outDir dist/scripts \
    --module commonjs \
    --target es2020 \
    --esModuleInterop \
    --skipLibCheck \
    2>/dev/null || true

FROM node:20-alpine AS production

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3002

CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/scripts/seed-desafios.js && node dist/scripts/seed-admin.js && node dist/main"]
