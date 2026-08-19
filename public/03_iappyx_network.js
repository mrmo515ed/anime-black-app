/**
 * Anime Black - iappyxOS Core Module 03: Network & API Gateway Layer
 * File: 03_iappyx_network.js
 * 
 * Manages all server communications, API endpoints, authentication requests,
 * media uploads, offline retry queue, and native iappyx.httpClient routing.
 */

(function(window) {
  'use strict';

  const offlineQueue = [];
  const requestCache = new Map();

  const NetworkManager = {
    name: 'NetworkManager',
    baseUrl: '', // relative or configured API base
    token: null,
    timeoutMs: 15000,

    init: function() {
      this.restoreToken();
      this.setupQueueProcessing();
    },

    restoreToken: function() {
      if (window.StorageManager) {
        const session = window.StorageManager.getJSON('animeblack_session', null);
        if (session && session.token) {
          this.token = session.token;
        }
      }
    },

    setToken: function(token) {
      this.token = token;
      if (window.StorageManager) {
        const session = window.StorageManager.getJSON('animeblack_session', {}) || {};
        session.token = token;
        window.StorageManager.setJSON('animeblack_session', session);
      }
    },

    clearToken: function() {
      this.token = null;
      if (window.StorageManager) {
        const session = window.StorageManager.getJSON('animeblack_session', {}) || {};
        delete session.token;
        window.StorageManager.setJSON('animeblack_session', session);
      }
    },

    isOnline: function() {
      return typeof navigator !== 'undefined' ? navigator.onLine : true;
    },

    // Core Unified Request Method
    request: function(options) {
      const self = this;
      return new Promise((resolve, reject) => {
        const url = options.url || '';
        const method = (options.method || 'GET').toUpperCase();
        const headers = Object.assign({}, options.headers || {});
        const timeout = options.timeout || self.timeoutMs;
        const body = options.body;

        // Auto attach auth header if token exists and not already provided
        if (self.token && !headers['Authorization'] && !headers['authorization']) {
          headers['Authorization'] = `Bearer ${self.token}`;
        }

        if (typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
          if (!headers['Content-Type'] && !headers['content-type']) {
            headers['Content-Type'] = 'application/json';
          }
        }

        // 1. If running under iappyxOS with native httpClient bridge
        if (typeof window.iappyx !== 'undefined' &&
            window.iappyx.httpClient &&
            typeof window.iappyx.httpClient.request === 'function') {
          
          const cbId = 'http_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
          window._iappyxCb = window._iappyxCb || {};

          let stringBody = '';
          if (body) {
            stringBody = typeof body === 'string' ? body : JSON.stringify(body);
          }

          const requestOpts = {
            url: url.startsWith('http') ? url : (self.baseUrl + url),
            method: method,
            headers: headers,
            body: stringBody,
            timeout: timeout,
            trustAllCerts: false
          };

          const timer = setTimeout(() => {
            if (window._iappyxCb[cbId]) {
              delete window._iappyxCb[cbId];
              reject(new Error('Network request timed out (native)'));
            }
          }, timeout + 2000);

          window._iappyxCb[cbId] = function(res) {
            clearTimeout(timer);
            delete window._iappyxCb[cbId];

            if (!res || !res.ok) {
              const err = new Error(res && res.error ? res.error : 'Network error');
              reject(err);
              return;
            }

            let parsedData = res.body;
            try {
              parsedData = JSON.parse(res.body);
            } catch (e) {
              // Keep raw string if not JSON
            }

            resolve({
              ok: res.status >= 200 && res.status < 300,
              status: res.status,
              headers: res.headers || {},
              data: parsedData,
              body: res.body
            });
          };

          try {
            window.iappyx.httpClient.request(JSON.stringify(requestOpts), cbId);
          } catch (nativeErr) {
            clearTimeout(timer);
            delete window._iappyxCb[cbId];
            self.fallbackFetch(options, resolve, reject);
          }
          return;
        }

        // 2. Standard Web fetch Fallback
        self.fallbackFetch(options, resolve, reject);
      });
    },

    fallbackFetch: function(options, resolve, reject) {
      const url = options.url.startsWith('http') ? options.url : (this.baseUrl + options.url);
      const method = (options.method || 'GET').toUpperCase();
      const headers = Object.assign({}, options.headers || {});
      const body = options.body;

      let fetchBody = undefined;
      if (body) {
        if (body instanceof FormData || typeof body === 'string') {
          fetchBody = body;
        } else {
          fetchBody = JSON.stringify(body);
          if (!headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
          }
        }
      }

      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), options.timeout || this.timeoutMs) : null;

      fetch(url, {
        method: method,
        headers: headers,
        body: fetchBody,
        signal: controller ? controller.signal : undefined
      })
      .then(async (response) => {
        if (timeoutId) clearTimeout(timeoutId);
        let data;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          try {
            data = await response.json();
          } catch (e) {
            data = null;
          }
        } else {
          data = await response.text();
        }

        resolve({
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: data
        });
      })
      .catch((err) => {
        if (timeoutId) clearTimeout(timeoutId);
        // If offline and request is a mutation, add to offline queue
        if (!this.isOnline() && method !== 'GET') {
          this.enqueueOfflineRequest(options);
        }
        reject(err);
      });
    },

    // HTTP Convenience Methods
    get: function(url, headers = {}) {
      return this.request({ method: 'GET', url: url, headers: headers });
    },

    post: function(url, body = {}, headers = {}) {
      return this.request({ method: 'POST', url: url, body: body, headers: headers });
    },

    put: function(url, body = {}, headers = {}) {
      return this.request({ method: 'PUT', url: url, body: body, headers: headers });
    },

    patch: function(url, body = {}, headers = {}) {
      return this.request({ method: 'PATCH', url: url, body: body, headers: headers });
    },

    delete: function(url, headers = {}) {
      return this.request({ method: 'DELETE', url: url, headers: headers });
    },

    // Upload Handler (Supports both native iappyx upload and FormData)
    upload: function(url, formDataOrFilePath, onProgress) {
      const self = this;
      return new Promise((resolve, reject) => {
        // Native upload via iappyx if available and string path passed
        if (typeof formDataOrFilePath === 'string' &&
            typeof window.iappyx !== 'undefined' &&
            window.iappyx.httpClient &&
            typeof window.iappyx.httpClient.uploadFile === 'function') {
          
          const cbId = 'upload_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
          window._iappyxCb = window._iappyxCb || {};

          if (onProgress) {
            window.onTransferProgress = onProgress;
          }

          const requestOpts = {
            url: url.startsWith('http') ? url : (self.baseUrl + url),
            method: 'POST',
            headers: self.token ? { 'Authorization': `Bearer ${self.token}` } : {}
          };

          window._iappyxCb[cbId] = function(res) {
            delete window._iappyxCb[cbId];
            if (res && res.ok) {
              resolve(res);
            } else {
              reject(new Error(res ? res.error : 'Upload failed'));
            }
          };

          window.iappyx.httpClient.uploadFile(JSON.stringify(requestOpts), formDataOrFilePath, cbId);
          return;
        }

        // Web FormData upload
        self.request({
          url: url,
          method: 'POST',
          body: formDataOrFilePath
        }).then(resolve).catch(reject);
      });
    },

    // Offline Queue Manager
    enqueueOfflineRequest: function(requestOptions) {
      offlineQueue.push({
        options: requestOptions,
        enqueuedAt: Date.now()
      });
      if (window.App) {
        window.App.info(`Enqueued offline request to ${requestOptions.url}. Total queue size: ${offlineQueue.length}`);
      }
    },

    setupQueueProcessing: function() {
      if (typeof window !== 'undefined') {
        window.addEventListener('online', () => {
          this.processOfflineQueue();
        });
      }
    },

    processOfflineQueue: async function() {
      if (offlineQueue.length === 0) return;
      if (window.App) window.App.info(`Processing ${offlineQueue.length} pending offline requests...`);

      while (offlineQueue.length > 0) {
        const item = offlineQueue.shift();
        try {
          await this.request(item.options);
          if (window.App) window.App.info(`Processed queued request: ${item.options.url}`);
        } catch (err) {
          if (window.App) window.App.warn(`Queued request retry failed: ${item.options.url}`, err);
          // If network dropped again, put it back
          if (!this.isOnline()) {
            offlineQueue.unshift(item);
            break;
          }
        }
      }
    },

    checkHealth: function() {
      return this.get('/api/health').catch(() => ({ ok: false }));
    }
  };

  // Expose to window
  window.NetworkManager = NetworkManager;
  window.Network = NetworkManager;
  window.iappyxNetwork = NetworkManager;

})(typeof window !== 'undefined' ? window : this);
