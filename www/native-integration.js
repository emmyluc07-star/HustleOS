// Native integration for HustleOS
class NativeIntegration {
  constructor() {
    this.isNative = window.Capacitor?.isNativePlatform() || false;
    this.wakeLock = null;
  }

  async initialize() {
    if (!this.isNative) return;
    
    await this.requestPermissions();
    await this.setupBackgroundMode();
  }

  async requestPermissions() {
    if (!this.isNative) return;

    try {
      // Local notifications
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.requestPermissions();

      // Geolocation (for future features)
      const { Geolocation } = await import('@capacitor/geolocation');
      await Geolocation.requestPermissions();

    } catch (error) {
      console.log('Permission request failed:', error);
    }
  }

  async keepScreenAwake() {
    if (!this.isNative) {
      // Web fallback
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
      }
      return;
    }

    const { KeepAwake } = await import('@capacitor/keep-awake');
    await KeepAwake.keepAwake();
  }

  async allowScreenSleep() {
    if (!this.isNative) {
      if (this.wakeLock) {
        this.wakeLock.release();
        this.wakeLock = null;
      }
      return;
    }

    const { KeepAwake } = await import('@capacitor/keep-awake');
    await KeepAwake.allowSleep();
  }

  async setupBackgroundMode() {
    if (!this.isNative) return;

    try {
      const { BackgroundMode } = await import('@capacitor/background-mode');
      await BackgroundMode.enable();
    } catch (error) {
      console.log('Background mode setup failed:', error);
    }
  }

  async sendSystemAlarm(title, body) {
    if (!this.isNative) {
      // Web fallback
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: './favicon-32x32.png',
          tag: 'hustle-alarm',
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 200]
        });
      }
      return;
    }

    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.schedule({
      notifications: [{
        title,
        body,
        id: Date.now(),
        schedule: { at: new Date(Date.now() + 1000) },
        sound: 'default',
        attachments: null,
        actionTypeId: "",
        extra: null
      }]
    });
  }

  async checkBatteryOptimization() {
    if (!this.isNative) return true;

    try {
      const { Device } = await import('@capacitor/device');
      const info = await Device.getInfo();
      
      if (info.platform === 'android') {
        // Check if app is whitelisted from battery optimization
        // This requires a custom plugin - for now return false to prompt user
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  async requestBatteryOptimizationWhitelist() {
    if (!this.isNative) return;

    // This would require a custom Android plugin
    // For now, show instructions to user
    alert('To ensure reliable alarms:\n\n1. Go to Settings > Battery\n2. Find "Battery Optimization"\n3. Select "HustleOS"\n4. Choose "Don\'t optimize"');
  }
}

window.nativeIntegration = new NativeIntegration();