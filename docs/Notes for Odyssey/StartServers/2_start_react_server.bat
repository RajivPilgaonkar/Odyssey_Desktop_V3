
REM @echo off
set DRIVE_LETTER=E
%DRIVE_LETTER%:
cd \
cd odyssey_web\desktop\dev
call C:\Users\Server\AppData\Roaming\npm\serve -s build
cmd /k
