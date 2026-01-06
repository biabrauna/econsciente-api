#!/bin/bash

echo "========================================"
echo "  Setup PostgreSQL - EconSciente"
echo "========================================"
echo ""

# Verificar se o PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "[ERRO] PostgreSQL não encontrado"
    echo ""
    echo "Por favor, instale o PostgreSQL:"
    echo "  - Ubuntu/Debian: sudo apt-get install postgresql"
    echo "  - macOS: brew install postgresql"
    echo "  - Windows: https://www.postgresql.org/download/windows/"
    echo ""
    exit 1
fi

echo "[OK] PostgreSQL encontrado"
echo ""

# Configurações
export PGPASSWORD=123456
PGUSER=postgres
PGHOST=localhost
PGPORT=5432
DBNAME=fashionai_local

echo "Criando banco de dados: $DBNAME"
echo ""

# Tentar criar o banco de dados
psql -U "$PGUSER" -h "$PGHOST" -p "$PGPORT" -c "CREATE DATABASE $DBNAME;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "[OK] Banco de dados criado com sucesso!"
else
    echo "[INFO] Banco de dados já existe (tudo bem!)"
fi

echo ""
echo "========================================"
echo "  Setup concluído!"
echo "========================================"
echo ""
echo "Próximo passo:"
echo "1. Configure o arquivo .env com:"
echo "   DATABASE_URL=postgresql://postgres:123456@localhost:5432/fashionai_local"
echo ""
echo "2. Execute: npm run prisma:migrate"
echo ""
