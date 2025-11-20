@echo off
echo ========================================
echo   OncoVision Frontend - Setup
echo ========================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado o no está en PATH
    echo Por favor, instale Node.js 20.x o superior desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si npm está instalado
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm no está instalado
    echo npm debería venir incluido con Node.js
    pause
    exit /b 1
)

echo [1/3] Verificando Node.js y npm...
node --version
npm --version
echo.

echo [2/3] Limpiando instalación anterior (si existe)...
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
npm install
echo.

echo ========================================
echo   Setup completado exitosamente!
echo ========================================
echo.
echo Próximos pasos:
echo 1. Configurar archivo .env.local (si no existe)
echo 2. Ejecutar run_frontend.bat para iniciar el servidor
echo.
pause
