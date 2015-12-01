SET dest=..\A_PRODUKCJA
xcopy /y manifest.json %dest%\manifest.json
xcopy /ys *.html ..\A_PRODUKCJA
xcopy /ys *.min.js ..\A_PRODUKCJA
del ..\A_PRODUKCJA\A_PRODUKCJA.zip
"D:\Program Files\7-Zip\7zG.exe" a "..\A_PRODUKCJA\A_PRODUKCJA.zip" "..\A_PRODUKCJA\*"