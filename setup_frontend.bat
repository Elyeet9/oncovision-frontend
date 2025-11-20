@echo off
echo ========================================
echo   OncoVision Frontend - Setup
echo ========================================
echo.

REM Verificar si Node.js esta instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado o no esta en PATH
    echo Por favor, instale Node.js 20.x o superior desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si npm esta instalado
call npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm no esta instalado
    echo npm deberia venir incluido con Node.js
    pause
    exit /b 1
)

echo [1/3] Verificando Node.js y npm...
node --version
call npm --version
echo.

echo [2/3] Limpiando instalacion anterior (si existe)...
if exist node_modules (
    echo Eliminando node_modules...
    rmdir /s /q node_modules
)
if exist .next (
    echo Eliminando .next...
    rmdir /s /q .next
)
if exist package-lock.json (
    echo Eliminando package-lock.json...
    del package-lock.json
)
echo.

echo [3/3] Instalando dependencias...
echo Esto puede tardar varios minutos...
call npm install
echo.

echo ========================================
echo   Setup completado exitosamente!
echo ========================================
echo.
echo Proximos pasos:
echo 1. Configurar archivo .env.local (si no existe)
echo 2. Ejecutar run_frontend.bat para iniciar el servidor
echo.
pause
