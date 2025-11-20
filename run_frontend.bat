@echo off
echo ========================================
echo   OncoVision Frontend - Servidor Next.js
echo ========================================
echo.

REM Verificar si Node.js esta instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado o no esta en PATH
    echo Por favor, instale Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si existen las dependencias
if not exist node_modules (
    echo ERROR: No se encontraron las dependencias instaladas.
    echo Por favor, ejecute setup_frontend.bat primero.
    pause
    exit /b 1
)

REM Verificar si existe el archivo .env.local
if not exist .env.local (
    echo ADVERTENCIA: No se encontro el archivo .env.local
    echo Desea crear uno con la configuracion por defecto? (S/N)
    set /p createenv=
    if /i "%createenv%"=="S" (
        echo NEXT_PUBLIC_API_URL=http://127.0.0.1:8080 > .env.local
        echo NEXT_PUBLIC_API_IP=127.0.0.1 >> .env.local
        echo NEXT_PUBLIC_API_PORT=8080 >> .env.local
        echo.
        echo Archivo .env.local creado con configuracion por defecto
        echo.
    )
)

echo Iniciando servidor Next.js en http://localhost:3000/
echo.
echo Presione Ctrl+C para detener el servidor
echo ========================================
echo.

call npm run dev
