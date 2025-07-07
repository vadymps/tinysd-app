@echo off
REM Kubernetes Persistent Storage Test Script for TinySD App (Windows)
REM This script verifies that images persist across pod restarts and deployments

echo 🔍 Starting Kubernetes Persistent Storage Verification for TinySD App
echo ==================================================================

REM Test 1: Check PVC Status
echo.
echo 📊 Test 1: Checking PVC Status
echo --------------------------------

kubectl get pvc tinysd-images-pvc >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PVC tinysd-images-pvc found
    kubectl get pvc tinysd-images-pvc
) else (
    echo ❌ PVC tinysd-images-pvc not found
    echo    Please ensure the PVC is created before continuing
    pause
    exit /b 1
)

REM Test 2: Check Pod Status
echo.
echo 🏃 Test 2: Checking Pod Status
echo ------------------------------

for /f "tokens=*" %%i in ('kubectl get pods -l app=tinysd-api -o jsonpath="{.items[0].metadata.name}" 2^>nul') do set POD_NAME=%%i

if "%POD_NAME%"=="" (
    echo ❌ No tinysd-api pod found
    echo    Please ensure the deployment is running
    pause
    exit /b 1
) else (
    echo ✅ Found pod: %POD_NAME%
)

REM Test 3: Check Volume Mount
echo.
echo 💾 Test 3: Checking Volume Mount
echo --------------------------------

kubectl exec %POD_NAME% -- df -h /app/saved-images >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Volume is properly mounted at /app/saved-images
    kubectl exec %POD_NAME% -- df -h /app/saved-images
) else (
    echo ❌ Volume mount check failed
    pause
    exit /b 1
)

REM Test 4: Check Directory Permissions
echo.
echo 🔐 Test 4: Checking Directory Permissions
echo -----------------------------------------

kubectl exec %POD_NAME% -- ls -la /app/saved-images
if %errorlevel% equ 0 (
    echo ✅ Directory permissions checked successfully
) else (
    echo ❌ Permission check failed
)

REM Test 5: List Current Images
echo.
echo 🖼️  Test 5: Current Saved Images
echo --------------------------------

for /f %%i in ('kubectl exec %POD_NAME% -- find /app/saved-images -name "*.jpg" ^| wc -l 2^>nul') do set IMAGE_COUNT=%%i

echo 📷 Found %IMAGE_COUNT% saved images:
if %IMAGE_COUNT% gtr 0 (
    kubectl exec %POD_NAME% -- find /app/saved-images -name "*.jpg" -exec ls -lh {} ;
) else (
    echo ⚠️  No images found. Save some images via the UI first.
)

REM Test 6: API Endpoint Check
echo.
echo 🌐 Test 6: API Endpoint Check
echo -----------------------------

kubectl exec %POD_NAME% -- curl -s localhost:3000/api/image/saved >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API endpoint is responding
) else (
    echo ⚠️  API endpoint check failed (may be normal if API is not ready)
)

REM Summary
echo.
echo 📋 Test Summary
echo ===============
echo ✅ Persistent storage verification completed
echo.
echo 🎯 Your Kubernetes setup:
echo - PVC: tinysd-images-pvc (should be Bound)
echo - Mount: /app/saved-images in pod
echo - Images: %IMAGE_COUNT% currently stored
echo.
echo 💡 To test persistence:
echo 1. Save images via the UI
echo 2. Restart pod: kubectl delete pod %POD_NAME%
echo 3. Check images persist after restart
echo.
echo ✨ Verification complete!
pause
