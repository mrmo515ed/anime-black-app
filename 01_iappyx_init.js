/**
 * Anime Black - iappyxOS Core Module 01: Initialization & Lifecycle Coordinator
 * File: 01_iappyx_init.js
 * 
 * Coordinates system startup, environment detection, module dependencies,
 * lifecycle state changes, error logging, and global event dispatching.
 */

(function(window) {
  'use strict';

  // Global App Registry
  const App = {
    name: 'Anime Black',
    nameAr: 'أنمي بلاك',
    version: '2.5.0',
    build: 2050,
    ready: false,
    environment: {
      isIappyx: false,
      isAndroid: false,
      isWebView: false,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      hasTouch: typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    },
    state: {
      initialized: false,
      session: null,
      currentUser: null,
      activeTab: 'home',
      theme: 'dark', // dark | amoled | light
      language: 'ar', // ar | en
      isRTL: true,
      networkState: 'online',
      unreadNotifications: 0,
      unreadMessages: 0
    },
    config: {
      apiTimeout: 15000,
      debug: true,
      syncInterval: 30000,
      offlineCacheEnabled: true
    },
    modules: {},
    listeners: {}
  };

  // Centralized Logger
  App.debug = function(...args) {
    if (App.config.debug && typeof console !== 'undefined') {
      console.log('[AnimeBlack:Debug]', ...args);
    }
  };

  App.info = function(...args) {
    if (typeof console !== 'undefined') {
      console.info('[AnimeBlack:Info]', ...args);
    }
  };

  App.warn = function(...args) {
    if (typeof console !== 'undefined') {
      console.warn('[AnimeBlack:Warn]', ...args);
    }
  };

  App.error = function(...args) {
    if (typeof console !== 'undefined') {
      console.error('[AnimeBlack:Error]', ...args);
    }
    App.emit('error', args);
  };

  // Event Pub/Sub System
  App.on = function(event, callback) {
    if (!App.listeners[event]) App.listeners[event] = [];
    App.listeners[event].push(callback);
    return function unsubscribe() {
      App.off(event, callback);
    };
  };

  App.off = function(event, callback) {
    if (!App.listeners[event]) return;
    App.listeners[event] = App.listeners[event].filter(cb => cb !== callback);
  };

  App.emit = function(event, data) {
    if (App.listeners[event]) {
      App.listeners[event].forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          App.error(`Error in event listener for ${event}:`, err);
        }
      });
    }
  };

  // Environment Detection
  function detectEnvironment() {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    App.environment.isAndroid = /Android/i.test(userAgent);
    App.environment.isWebView = /wv|Android.*Version\/[0-9.]+/i.test(userAgent) || (window.iappyx !== undefined);
    App.environment.isIappyx = typeof window.iappyx !== 'undefined' || !!window.isIappyxApp;
    App.info(`Environment detected: Android=${App.environment.isAndroid}, iappyxOS=${App.environment.isIappyx}, WebView=${App.environment.isWebView}`);
  }

  // Sequential Startup Workflow
  App.init = function() {
    if (App.state.initialized) {
      App.warn('App already initialized');
      return;
    }

    App.info('Starting Anime Black system initialization...');
    detectEnvironment();

    // 1. Initialize Storage Layer
    if (window.StorageManager && typeof window.StorageManager.init === 'function') {
      try {
        window.StorageManager.init();
        App.modules.storage = window.StorageManager;
        App.info('Storage module initialized.');
      } catch (e) {
        App.error('Failed to initialize Storage module:', e);
      }
    }

    // 2. Initialize Native Bridges
    if (window.NativeBridge && typeof window.NativeBridge.init === 'function') {
      try {
        window.NativeBridge.init();
        App.modules.native = window.NativeBridge;
        App.info('Native bridge module initialized.');
      } catch (e) {
        App.error('Failed to initialize Native module:', e);
      }
    }

    // 3. Initialize Fallback System
    if (window.FallbackSystem && typeof window.FallbackSystem.init === 'function') {
      try {
        window.FallbackSystem.init();
        App.modules.fallback = window.FallbackSystem;
        App.info('Fallback module initialized.');
      } catch (e) {
        App.error('Failed to initialize Fallback module:', e);
      }
    }

    // 4. Initialize Network Layer
    if (window.NetworkManager && typeof window.NetworkManager.init === 'function') {
      try {
        window.NetworkManager.init();
        App.modules.network = window.NetworkManager;
        App.info('Network module initialized.');
      } catch (e) {
        App.error('Failed to initialize Network module:', e);
      }
    }

    // 5. Restore User Settings & Theme
    restoreSettings();

    // 6. Restore Authentication Session
    restoreSession();

    // 7. Setup Lifecycle Listeners
    setupLifecycleListeners();

    App.state.initialized = true;
    App.ready = true;
    App.emit('ready', App.state);
    App.info('Anime Black initialized successfully!');
  };

  // Restore Theme, Language, and Preferences
  function restoreSettings() {
    if (window.StorageManager) {
      const savedTheme = window.StorageManager.get('animeblack_theme', 'dark');
      const savedLang = window.StorageManager.get('animeblack_lang', 'ar');
      App.state.theme = savedTheme;
      App.state.language = savedLang;
      App.state.isRTL = savedLang === 'ar';
      applyThemeAndLanguage(savedTheme, savedLang);
    }
  }

  // Restore Session
  function restoreSession() {
    if (window.StorageManager) {
      const session = window.StorageManager.getJSON('animeblack_session', null);
      const user = window.StorageManager.getJSON('animeblack_user', null);
      if (session && user) {
        App.state.session = session;
        App.state.currentUser = user;
        App.emit('session_restored', { session, user });
      }
    }
  }

  function applyThemeAndLanguage(theme, lang) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    root.setAttribute('lang', lang);
  }

  // Setup Lifecycle, Visibility, and Network change listeners
  function setupLifecycleListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      App.state.networkState = 'online';
      App.environment.isOnline = true;
      App.emit('network_online');
      App.info('Device is back ONLINE');
    });

    window.addEventListener('offline', () => {
      App.state.networkState = 'offline';
      App.environment.isOnline = false;
      App.emit('network_offline');
      App.warn('Device is OFFLINE - activating local cache mode');
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        App.emit('app_background');
      } else {
        App.emit('app_foreground');
        // Refresh session if needed
        if (window.NetworkManager && typeof window.NetworkManager.checkHealth === 'function') {
          window.NetworkManager.checkHealth();
        }
      }
    });

    window.addEventListener('error', (e) => {
      App.error('Unhandled window error:', e.message, e.filename, e.lineno);
    });

    window.addEventListener('unhandledrejection', (e) => {
      if (typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
      const reasonMsg = e && e.reason ? (e.reason.message || String(e.reason)) : 'Unknown reason';
      App.debug('Handled unhandled rejection safely:', reasonMsg);
    });
  }

  // iappyxOS bridge initialization loop
  function _initIappyxBridge() {
    if (typeof window.iappyx === 'undefined') {
      setTimeout(_initIappyxBridge, 50);
      return;
    }
    App.environment.isIappyx = true;
    window.isIappyxApp = true;
    App.info('iappyxOS native bridge connected.');
    App.emit('iappyx_bridge_ready');
  }

  // Export to global window
  window.App = App;
  window.iappyxInit = App;

  // Auto trigger on window load
  if (typeof window !== 'undefined') {
    window.addEventListener('load', function() {
      setTimeout(_initIappyxBridge, 100);
      setTimeout(function() {
        if (!App.state.initialized) {
          App.init();
        }
      }, 150);
    });
  }

})(typeof window !== 'undefined' ? window : this);
