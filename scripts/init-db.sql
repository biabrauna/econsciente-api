-- Script de inicialização do PostgreSQL
-- Este script é executado automaticamente quando o container é criado

-- Criar extensões úteis
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- Para pesquisa de texto
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Para UUIDs se necessário

-- Mensagem de confirmação
SELECT 'Banco de dados fashionai_local inicializado com sucesso!' as status;
