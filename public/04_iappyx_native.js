/**
 * Anime Black - iappyxOS Core Module 04: Native Android & Hardware Bridge Layer
 * File: 04_iappyx_native.js
 * 
 * Verified exact iappyxOS bridge implementations with safety guards,
 * standard async cbId patterns, and feature availability detection.
 */

(function(window) {
  'use strict';

  // Helper for generating standard one-shot async callbacks
  function createCallback(prefix, resolve, reject, timeoutMs = 30000) {
    const cbId = prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    window._iappyxCb = window._iappyxCb || {};

    const timer = setTimeout(() => {
      if (window._iappyxCb[cbId]) {
        delete window._iappyxCb[cbId];
        reject(new Error(`Operation ${prefix} timed out after ${timeoutMs}ms`));
      }
    }, timeoutMs);

    window._iappyxCb[cbId] = function(result) {
      clearTimeout(timer);
      delete window._iappyxCb[cbId];
      if (result && result.ok === false) {
        reject(new Error(result.error || 'Native operation failed'));
      } else {
        resolve(result);
      }
    };

    return cbId;
  }

  const NativeBridge = {
    name: 'NativeBridge',
    isReady: false,

    init: function() {
      this.isReady = typeof window.iappyx !== 'undefined';
      if (this.isReady && window.App) {
        window.App.info('Native bridge initialized with iappyxOS');
      }
    },

    isAvailable: function(moduleName, methodName) {
      if (typeof window.iappyx === 'undefined') return false;
      if (!moduleName) return true;
      if (!window.iappyx[moduleName]) return false;
      if (!methodName) return true;
      return typeof window.iappyx[moduleName][methodName] === 'function';
    },

    // --- Vibration & Haptics ---
    vibrate: {
      click: function() {
        if (typeof window.iappyx !== 'undefined' && window.iappyx.vibration && window.iappyx.vibration.click) {
          try { window.iappyx.vibration.click(); return true; } catch (e) {}
        }
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(10); return true; } catch (e) {}
        }
        return false;
      },
      tick: function() {
        if (typeof window.iappyx !== 'undefined' && window.iappyx.vibration && window.iappyx.vibration.tick) {
          try { window.iappyx.vibration.tick(); return true; } catch (e) {}
        }
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(5); return true; } catch (e) {}
        }
        return false;
      },
      heavyClick: function() {
        if (typeof window.iappyx !== 'undefined' && window.iappyx.vibration && window.iappyx.vibration.heavyClick) {
          try { window.iappyx.vibration.heavyClick(); return true; } catch (e) {}
        }
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(25); return true; } catch (e) {}
        }
        return false;
      },
      custom: function(durationMs) {
        if (typeof window.iappyx !== 'undefined' && window.iappyx.vibration && window.iappyx.vibration.vibrate) {
          try { window.iappyx.vibration.vibrate(String(durationMs)); return true; } catch (e) {}
        }
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate(Number(durationMs)); return true; } catch (e) {}
        }
        return false;
      }
    },

    // --- Camera & Vision ---
    camera: {
      takePhoto: function() {
        return new Promise((resolve, reject) => {
          if (typeof window.iappyx !== 'undefined' && window.iappyx.camera && window.iappyx.camera.takePhoto) {
            const cbId = createCallback('cam_photo', resolve, reject);
            try {
              window.iappyx.camera.takePhoto(cbId);
            } catch (err) {
              reject(err);
            }
          } else {
            // Fallback to file picker
            if (window.FallbackSystem && window.FallbackSystem.pickImageFile) {
              window.FallbackSystem.pickImageFile().then(resolve).catch(reject);
            } else {
              reject(new Error('Camera not supported in this environment'));
            }
          }
        });
      },
      scanQR: function() {
        return new Promise((resolve, reject) => {
          if (typeof window.iappyx !== 'undefined' && window.iappyx.camera && window.iappyx.camera.scanQR) {
            const cbId = createCallback('cam_qr', resolve, reject);
            window.iappyx.camera.scanQR(cbId);
          } else {
            reject(new Error('QR scanner not available'));
          }
        });
      },
      scanText: function() {
        return new Promise((resolve, reject) => {
          if (typeof window.iappyx !== 'undefined' && window.iappyx.camera && window.iappyx.camera.scanText) {
            const cbId = createCallback('cam_ocr', resolve, reject);
            window.iappyx.camera.scanText(cbId);
          } else {
            reject(new Error('OCR text scan not available'));
          }
        });
      }
    },

    // --- Media & Gallery ---
    media: {
      pickImage: function() {
        return new Promise((resolve, reject) => {
          if (typeof window.iappyx !== 'undefined' && window.iappyx.media && window.iappyx.media.pickImage) {
            const cbId = createCallback('media_pick', resolve, reject);
            window.iappyx.media.pickImage(cbId);
          } else {
            if (window.FallbackSystem && window.FallbackSystem.pickImageFile) {
              window.FallbackSystem.pickImageFile().then(resolve).catch(reject);
            } else {
              reject(new Error('Media picker unavailable'));
            }
          }
        });
      },
      saveToGallery: function(base64Data, filename = 'animeblack_img.jpg') {
        return new Promise((resolve, reject) => {
          if (typeof window.iappyx !== 'undefined' && window.iappyx.media && window.iappyx.media.saveToGallery) {
            const cbId = createCallback('media_save', resolve, reject);
            window.iappyx.media.saveToGallery(cbId, base64Data, filename);
          } else {
            reject(new Error('saveToGallery unavailable'));
          }
        });
      }
    },

    // --- Clipboard ---
    clipboard: {
      write: function(text) {
        if (typeof window.iappyx !== 'undefined' && window.iappyx.clipboard && window.iappyx.clipboard.write) {
          try {
            window.iappyx.clipboard.write(text);
            return Promise.resolve(true);
          } catch (e) {}
        }
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          return navigator.clipboard.writeText(text).then(() => true);
        }
        return Promise.resolve(false);
      },
      read: function() {
        if (typeof window.iappyx !== 'undefined' && window.iappyx.clipboard && window.iappyx.clipboard.read) {
          try {
            const text = window.iappyx.clipboard.read();
            return Promise.resolve(text);
          } catch (e) {}
        }
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
          return navigator.clipboard.readText();
        }
        return Promise.resolve(null);
      }
    },

    // --- Notifications ---
    notification: {
      send: function(title, body) {
        if (typeof window.iappyx !== 'undefined' && window.iappyx.notification && window.iappyx.notification.send) {
          try {
            window.iappyx.notification.send(title, body);
            return true;
          } catch (e) {}
        }
        if (window.FallbackSystem && window.FallbackSystem.showToast) {
          window.FallbackSystem.showToast(`${title}: ${body}`, 'info');
        }
        return false;
      },
      setBadge: function(count) {
        if (typeof window.iappyx !== 'undefined' && window.iappyx.notification && window.iappyx.notification.setBadge) {
          try {
            window.iappyx.notification.setBadge(Number(count));
            return true;
          } catch (e) {}
        }
        return false;
      }
    },

    // --- Device Info & Hardware ---
    device: {
      getInfo: function() {
        if (typeof window.iappyx !== 'undefined' && window.iappyx.device && window.iappyx.device.getDeviceInfo) {
          try {
            return JSON.parse(window.iappyx.device.getDeviceInfo());
          } catch (e) {}
        }
        return {
          brand: 'Web',
          model: 'Browser',
          isDarkMode: true,
          platform: 'browser'
        };
      },
      setTorch: function(enable) {
        if (typeof window.iappyx !== 'undefined' && window.iappyx.device && window.iappyx.device.setTorch) {
          try {
            window.iappyx.device.setTorch(Boolean(enable));
            return true;
          } catch (e) {}
        }
        return false;
      }
    },

    // --- Screen Control ---
    screen: {
      keepOn: function(keepOn) {
        if (typeof window.iappyx !== 'undefined' && window.iappyx.screen && window.iappyx.screen.keepOn) {
          try {
            window.iappyx.screen.keepOn(Boolean(keepOn));
            return true;
          } catch (e) {}
        }
        return false;
      }
    },

    // --- Share Sheet ---
    share: {
      shareText: function(text, subject = 'Anime Black') {
        if (typeof window.iappyx !== 'undefined' && window.iappyx.shareText) {
          try {
            window.iappyx.shareText(text, subject);
            return true;
          } catch (e) {}
        }
        if (typeof navigator !== 'undefined' && navigator.share) {
          navigator.share({ title: subject, text: text }).catch(() => {});
          return true;
        }
        NativeBridge.clipboard.write(text);
        if (window.FallbackSystem) {
          window.FallbackSystem.showToast('تم نسخ الرابط للحافظة', 'success');
        }
        return true;
      }
    },

    // --- Audio Sound Effects ---
    audio: {
      playSound: function(url) {
        if (typeof window.iappyx !== 'undefined' && window.iappyx.audio && window.iappyx.audio.playSound) {
          try {
            window.iappyx.audio.playSound(url);
            return true;
          } catch (e) {}
        }
        try {
          const snd = new Audio(url);
          snd.play().catch(() => {});
          return true;
        } catch (e) {}
        return false;
      }
    }
  };

  // Expose to window
  window.NativeBridge = NativeBridge;
  window.Native = NativeBridge;
  window.iappyxNative = NativeBridge;

})(typeof window !== 'undefined' ? window : this);
