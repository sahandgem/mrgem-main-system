@echo off
cd /d "%~dp0"
call npm.cmd run dev --workspace @master-gem/core -- --host 0.0.0.0 --port 5174
pause
