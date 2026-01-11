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
    console.log('📱 Starting permission requests...');
    
    if (!this.isNative) {
      console.log('🌐 Web mode - requesting browser permissions');
      
      // Request notification permission aggressively
      if ('Notification' in window) {
        console.log('🔔 Current notification permission:', Notification.permission);
        
        if (Notification.permission === 'default' || Notification.permission === 'denied') {
          console.log('📱 Requesting notification permission...');
          const permission = await Notification.requestPermission();
          console.log('📱 New permission:', permission);
          
          if (permission === 'granted') {
            // Test notification immediately
            try {
              const testNotif = new Notification('✅ HustleOS Permissions', {
                body: 'Notifications are now enabled!',
                icon: './favicon-32x32.png',
                tag: 'permission-test'
              });
              setTimeout(() => testNotif.close(), 3000);
              alert('✅ Notification permission granted!');
            } catch (e) {
              alert('⚠️ Permission granted but notification failed: ' + e.message);
            }
          } else {
            alert('❌ Notification permission denied. Please enable in browser settings.');
          }
        } else if (Notification.permission === 'granted') {
          alert('✅ Notifications already enabled!');
        }
      } else {
        alert('❌ Notifications not supported in this browser');
      }
      return;
    }

    // Native mode - use Capacitor plugin system
    console.log('📱 Native mode - requesting Android permissions');
    let results = [];
    
    try {
      // Use Capacitor plugin system
      if (window.Capacitor?.Plugins?.LocalNotifications) {
        console.log('🔔 Requesting local notification permissions...');
        const notifResult = await window.Capacitor.Plugins.LocalNotifications.requestPermissions();
        console.log('🔔 Notification result:', notifResult);
        results.push(`Notifications: ${notifResult.display}`);
        
        // Test native notification
        if (notifResult.display === 'granted') {
          await window.Capacitor.Plugins.LocalNotifications.schedule({
            notifications: [{
              title: '✅ HustleOS Permissions',
              body: 'Native notifications enabled!',
              id: 999999,
              schedule: { at: new Date(Date.now() + 1000) }
            }]
          });
        }
      } else {
        results.push('Notifications: Plugin not available');
      }

      alert('📱 Permission Results:\n' + results.join('\n'));
      return true;

    } catch (error) {
      console.log('❌ Permission request failed:', error);
      alert('❌ Permission request failed: ' + error.message);
      return false;
    }
  }

  async keepScreenAwake() {
    if (!this.isNative) {
      // Web fallback with enhanced wake lock
      if ('wakeLock' in navigator) {
        try {
          this.wakeLock = await navigator.wakeLock.request('screen');
          console.log('Web wake lock activated');
          
          // Re-request wake lock when it's released
          this.wakeLock.addEventListener('release', async () => {
            console.log('Wake lock released, attempting to reacquire...');
            try {
              this.wakeLock = await navigator.wakeLock.request('screen');
            } catch (err) {
              console.log('Failed to reacquire wake lock:', err);
            }
          });
        } catch (err) {
          console.log('Wake lock failed:', err);
        }
      }
      return;
    }

    // Use Capacitor plugin system
    if (window.Capacitor?.Plugins?.KeepAwake) {
      await window.Capacitor.Plugins.KeepAwake.keepAwake();
    }
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
    console.log('🚨 Sending system alarm:', title);
    
    if (!this.isNative) {
      console.log('🌐 Web mode - using browser notifications');
      return false; // Let web notification handle it
    }

    try {
      // Use Capacitor plugin system with simpler approach
      if (window.Capacitor?.Plugins?.LocalNotifications) {
        const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
        
        console.log('📱 Scheduling native notification...');
        
        // Schedule immediate notification
        const result = await LocalNotifications.schedule({
          notifications: [{
            title,
            body,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 50) }, // 50ms delay
            sound: 'default',
            priority: 5, // MAX priority
            ongoing: false,
            autoCancel: true,
            extra: {
              data: 'alarm'
            }
          }]
        });
        
        console.log('✅ Native notification scheduled:', result);
        return true;
      } else {
        console.log('❌ LocalNotifications plugin not available');
        return false;
      }
      
    } catch (error) {
      console.log('❌ Native notification failed:', error);
      return false;
    }
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
    if (!this.isNative) {
      alert('Battery optimization settings:\n\n1. Go to browser settings\n2. Find "Site Settings" or "Permissions"\n3. Allow notifications and background sync for HustleOS');
      return;
    }

    try {
      // For native Android, open battery optimization settings
      if (window.Capacitor?.Plugins?.App) {
        await window.Capacitor.Plugins.App.openUrl({ url: 'android-settings:REQUEST_IGNORE_BATTERY_OPTIMIZATIONS' });
      }
    } catch (error) {
      // Fallback: Show manual instructions
      alert('To ensure reliable alarms:\n\n1. Go to Settings > Battery\n2. Find "Battery Optimization"\n3. Select "HustleOS"\n4. Choose "Don\'t optimize"\n\nThis prevents Android from killing the app.');
    }
  }
  
  async wakeScreen(shouldWake) {
    if (!this.isNative) return;
    
    try {
      // Call native method to handle screen wake
      if (window.Capacitor?.Plugins?.App) {
        // For now, we'll handle this through the existing wake lock system
        if (shouldWake) {
          await this.keepScreenAwake();
        }
      }
    } catch (error) {
      console.log('Screen wake control failed:', error);
    }
  }
}

window.nativeIntegration = new NativeIntegration();