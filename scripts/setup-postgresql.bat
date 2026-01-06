@echo off
echo ========================================
echo   Setup PostgreSQL - EconSciente
echo ========================================
echo.

REM Verificar se o PostgreSQL está instalado
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] PostgreSQL nao encontrado no PATH
    echo.
    echo Por favor, instale o PostgreSQL:
    echo https://www.postgresql.org/download/windows/
    echo.
    echo Ou adicione o PostgreSQL ao PATH do sistema
    pause
    exit /b 1
)

echo [OK] PostgreSQL encontrado
echo.

REM Configurações
set PGPASSWORD=123456
set PGUSER=postgres
set PGHOST=localhost
set PGPORT=5432
set DBNAME=fashionai_local

echo Criando banco de dados: %DBNAME%
echo.

REM Tentar criar o banco de dados
psql -U %PGUSER% -h %PGHOST% -p %PGPORT% -c "CREATE DATABASE %DBNAME%;" 2>nul

if %errorlevel% equ 0 (
    echo [OK] Banco de dados criado com sucesso!
) else (
    echo [INFO] Banco de dados ja existe (tudo bem!)
)

echo.
echo ========================================
echo   Setup concluido!
echo ========================================
echo.
echo Proximo passo:
echo 1. Configure o arquivo .env com:
echo    DATABASE_URL=postgresql://postgres:123456@localhost:5432/fashionai_local
echo.
echo 2. Execute: npm run prisma:migrate
echo.
pause
