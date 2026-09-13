@echo off
set msg=%~1
if "%msg%"=="" set msg=Mise a jour CineChroma

echo [CineChroma] Envoi des modifications vers GitHub...
git add .
git commit -m "%msg%"
git push origin main
echo [CineChroma] Termine avec succes !
