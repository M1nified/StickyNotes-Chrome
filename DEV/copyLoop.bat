@echo off
:top
call babel.bat
call copyOtherFiles.bat
timeout 60
goto top
