@echo off
REM bootstrap-admin.cmd - Crée le premier admin pour développement local (Windows)

setlocal enabledelayedexpansion

set "ENDPOINT=http://localhost:8787"
set "BOOTSTRAP_TOKEN=ba8277f9c94b0cc120ecd85dcd66bbc069ef5be2f6b998326cd628571a80127c"

echo.
echo 📝 Bootstrap Admin - Trinquat Hub
echo ==================================
echo.

REM Vérifier que le serveur est en marche
echo 🔍 Vérification du serveur...
curl -s "%ENDPOINT%" >nul 2>&1
if errorlevel 1 (
    echo ❌ Le serveur n'est pas accessible sur %ENDPOINT%
    echo    Lancez d'abord: npm run dev
    pause
    exit /b 1
)
echo ✅ Serveur accessible
echo.

REM Demander email
set /p EMAIL="📧 Email admin: "

REM Demander password (simple avec asterisks)
set /p PASSWORD="🔑 Mot de passe: "
echo.

REM Faire la requête
echo ⏳ Création du premier admin...
echo.

powershell -Command ^
  "$response = Invoke-WebRequest -Uri '%ENDPOINT%/api/admin/bootstrap' " ^
  "  -Method POST " ^
  "  -Headers @{'Content-Type'='application/json'; 'x-bootstrap-token'='%BOOTSTRAP_TOKEN%'} " ^
  "  -Body ('{\"email\":\"%EMAIL%\",\"password\":\"%PASSWORD%\"}' | ConvertTo-Json) " ^
  "  -ErrorAction SilentlyContinue; " ^
  "if ($response.StatusCode -eq 200) { Write-Host '✅ Admin créé avec succès!' -ForegroundColor Green } " ^
  "else { Write-Host '❌ Erreur lors de la création' -ForegroundColor Red }"

echo.
echo 🎉 Vous pouvez maintenant vous connecter:
echo    URL: %ENDPOINT%/admin/login
echo    Email: %EMAIL%
echo    Mot de passe: (celui que vous avez entré)
echo.
pause
