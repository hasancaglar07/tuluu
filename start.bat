@echo off
setlocal
cd /d "%~dp0"

echo Projeler baslatiliyor...
set "NODE_OPTIONS="
set "NAPI_RS_FORCE_WASI=1"

echo API baslatiliyor (Port 3001)
start "API" cmd /k "set NODE_OPTIONS= && set NAPI_RS_FORCE_WASI=1 && cd /d ""%~dp0api"" && npm.cmd run dev"

echo Frontend baslatiliyor (Port 3000)
start "Front" cmd /k "set NODE_OPTIONS= && set NAPI_RS_FORCE_WASI=1 && cd /d ""%~dp0front"" && npm.cmd run dev"

echo Islemler baslatildi.
pause
