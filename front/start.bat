@echo off
setlocal
cd /d "%~dp0"
set "NODE_OPTIONS="
set "NAPI_RS_FORCE_WASI=1"

echo Frontend (On Yuz) baslatiliyor...
npm.cmd run dev
pause
