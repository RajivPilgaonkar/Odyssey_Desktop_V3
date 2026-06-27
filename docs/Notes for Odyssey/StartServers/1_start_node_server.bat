setlocal

REM Define the name of the Node.js server process to check for
set SERVER_PROCESS_NAME=node.exe

REM Check if the server process is already running
tasklist /FI "IMAGENAME eq %SERVER_PROCESS_NAME%" | find /i "%SERVER_PROCESS_NAME%" > nul
if %errorlevel% equ 0 (
    echo Server is already running.
    exit /b 1
)


REM @echo off
set DRIVE_LETTER=E
%DRIVE_LETTER%:
cd \
cd E:\odyssey_web\backend\dev
call node app.js
cmd /k