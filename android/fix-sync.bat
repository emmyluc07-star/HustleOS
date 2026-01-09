@echo off
echo Fixing Android Studio sync issues...

REM Delete problematic cache directories
if exist ".gradle" rmdir /s /q ".gradle"
if exist "build" rmdir /s /q "build"
if exist "app\build" rmdir /s /q "app\build"
if exist "capacitor-cordova-android-plugins\build" rmdir /s /q "capacitor-cordova-android-plugins\build"

REM Delete Android Studio cache
if exist ".idea" rmdir /s /q ".idea"

echo Cache cleared. Now open Android Studio and:
echo 1. File -> Invalidate Caches and Restart
echo 2. Build -> Clean Project
echo 3. Build -> Rebuild Project
echo.
echo If Java errors persist, install JDK 17 from:
echo https://adoptium.net/temurin/releases/
pause