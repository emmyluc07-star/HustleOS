@echo off
echo Building HustleOS Native App...

echo Installing dependencies...
call npm install

echo Initializing Capacitor...
call npx cap init "HustleOS" "com.hustleos.app" --web-dir="."

echo Adding Android platform...
call npx cap add android

echo Syncing files...
call npx cap sync

echo Build complete! 
echo.
echo Next steps:
echo 1. Open Android Studio: npx cap open android
echo 2. Build APK in Android Studio
echo 3. Test on device

pause