/**
 * Anime Black - iappyxOS Core Module 02: Storage & Cache Layer
 * File: 02_iappyx_storage.js
 * 
 * Provides unified, fault-tolerant persistence across iappyxOS native storage
 * and browser localStorage/sessionStorage with in-memory caching and fallback.
 */

(function(window) {
  'use strict';

  const memoryStore = new Map();

  const StorageManager = {
    name: 'StorageManager',
    isNativeStorageAvailable: false,

    init: function() {
      this.checkNativeStorage();
      this.syncThemeAndPreferences();
    },

    checkNativeStorage: function() {
      this.isNativeStorageAvailable = typeof window.iappyx !== 'undefined' &&
        typeof window.iappyx.save === 'function' &&
        typeof window.iappyx.load === 'function';
    },

    // Set a string value
    set: function(key, value) {
      if (!key) return false;
      const strVal = String(value);
      memoryStore.set(key, strVal);

      // Priority 1: Native iappyx storage
      if (this.isNativeStorageAvailable || (typeof window.iappyx !== 'undefined' && window.iappyx.save)) {
        try {
          window.iappyx.save(key, strVal);
        } catch (e) {
          if (window.App) window.App.warn('iappyx.save failed:', e);
        }
      }

      // Priority 2: Web localStorage
      try {
        if (typeof window.localStorage !== 'undefined') {
          window.localStorage.setItem(key, strVal);
        }
      } catch (err) {
        if (window.App) window.App.warn('localStorage.setItem failed (quota/privacy):', err);
      }

      return true;
    },

    // Get a string value with default fallback
    get: function(key, defaultValue = null) {
      if (!key) return defaultValue;

      // Check native first
      if (this.isNativeStorageAvailable || (typeof window.iappyx !== 'undefined' && window.iappyx.load)) {
        try {
          const val = window.iappyx.load(key);
          if (val !== null && val !== undefined && val !== '') {
            memoryStore.set(key, val);
            return val;
          }
        } catch (e) {
          if (window.App) window.App.warn('iappyx.load error:', e);
        }
      }

      // Check Web localStorage
      try {
        if (typeof window.localStorage !== 'undefined') {
          const localVal = window.localStorage.getItem(key);
          if (localVal !== null && localVal !== undefined) {
            memoryStore.set(key, localVal);
            return localVal;
          }
        }
      } catch (err) {
        if (window.App) window.App.warn('localStorage.getItem failed:', err);
      }

      // Check memory store
      if (memoryStore.has(key)) {
        return memoryStore.get(key);
      }

      return defaultValue;
    },

    // Store a parsed JSON object safely
    setJSON: function(key, objectValue) {
      if (!key) return false;
      try {
        const jsonString = JSON.stringify(objectValue);
        return this.set(key, jsonString);
      } catch (err) {
        if (window.App) window.App.error('Storage.setJSON serialization error:', err);
        return false;
      }
    },

    // Retrieve and parse a JSON object safely
    getJSON: function(key, defaultValue = null) {
      const raw = this.get(key, null);
      if (!raw) return defaultValue;
      try {
        return JSON.parse(raw);
      } catch (err) {
        if (window.App) window.App.warn(`Corrupted JSON in storage for key [${key}]. Resetting to default.`, err);
        return defaultValue;
      }
    },

    // Remove a key
    remove: function(key) {
      if (!key) return;
      memoryStore.delete(key);

      if (typeof window.iappyx !== 'undefined' && window.iappyx.remove) {
        try {
          window.iappyx.remove(key);
        } catch (e) {}
      }

      try {
        if (typeof window.localStorage !== 'undefined') {
          window.localStorage.removeItem(key);
        }
      } catch (e) {}
    },

    // Check if key exists
    has: function(key) {
      return this.get(key, null) !== null;
    },

    // Clear all app storage safely (does not wipe system)
    clear: function(preserveAuth = true) {
      const authSession = preserveAuth ? this.getJSON('animeblack_session', null) : null;
      const authUser = preserveAuth ? this.getJSON('animeblack_user', null) : null;
      const theme = this.get('animeblack_theme', 'dark');
      const lang = this.get('animeblack_lang', 'ar');

      memoryStore.clear();

      try {
        if (typeof window.iappyx !== 'undefined' && window.iappyx.storage && window.iappyx.storage.clear) {
          window.iappyx.storage.clear();
        }
      } catch (e) {}

      try {
        if (typeof window.localStorage !== 'undefined') {
          window.localStorage.clear();
        }
      } catch (e) {}

      if (preserveAuth) {
        if (authSession) this.setJSON('animeblack_session', authSession);
        if (authUser) this.setJSON('animeblack_user', authUser);
      }
      this.set('animeblack_theme', theme);
      this.set('animeblack_lang', lang);
    },

    // Draft Management
    saveDraft: function(type, content) {
      return this.setJSON(`draft_${type}`, {
        content: content,
        updatedAt: Date.now()
      });
    },

    getDraft: function(type) {
      return this.getJSON(`draft_${type}`, null);
    },

    clearDraft: function(type) {
      this.remove(`draft_${type}`);
    },

    // Initial theme synchronization
    syncThemeAndPreferences: function() {
      const theme = this.get('animeblack_theme', 'dark');
      const lang = this.get('animeblack_lang', 'ar');
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      }
    }
  };

  // Expose to window
  window.StorageManager = StorageManager;
  window.Storage = StorageManager;
  window.iappyxStorage = StorageManager;

})(typeof window !== 'undefined' ? window : this);
