/**
 * Anime Black - iappyxOS Core Module 05: Graceful Fallbacks & Web Compatibility Layer
 * File: 05_iappyx_fallback.js
 * 
 * Provides bulletproof web fallbacks, floating toast UI, in-app notifications,
 * file-picker fallbacks, and offline cache resilience.
 */

(function(window) {
  'use strict';

  const FallbackSystem = {
    name: 'FallbackSystem',
    toastContainer: null,

    init: function() {
      this.ensureToastContainer();
    },

    ensureToastContainer: function() {
      if (typeof document === 'undefined') return;
      let container = document.getElementById('animeblack-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'animeblack-toast-container';
        container.style.cssText = `
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 999999;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: none;
          max-width: 90vw;
          width: 380px;
        `;
        document.body.appendChild(container);
      }
      this.toastContainer = container;
    },

    // Floating Anime In-App Toast
    showToast: function(message, type = 'info', durationMs = 3500) {
      this.ensureToastContainer();
      if (!this.toastContainer) return;

      const toast = document.createElement('div');
      const colors = {
        success: { bg: '#102A1E', border: '#10B981', text: '#6EE7B7' },
        error: { bg: '#2A1010', border: '#EF4444', text: '#FCA5A5' },
        warning: { bg: '#2A2010', border: '#F59E0B', text: '#FCD34D' },
        info: { bg: '#18181B', border: '#3F3F46', text: '#E4E4E7' }
      };
      const theme = colors[type] || colors.info;

      toast.style.cssText = `
        background: ${theme.bg};
        border: 1px solid ${theme.border};
        color: ${theme.text};
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 600;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        gap: 10px;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: auto;
        direction: rtl;
        font-family: inherit;
      `;

      toast.textContent = message;
      this.toastContainer.appendChild(toast);

      // Trigger enter animation
      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
      });

      // Auto dismiss
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }, durationMs);
    },

    // File Picker Fallback for Web/Browser
    pickImageFile: function() {
      return new Promise((resolve, reject) => {
        if (typeof document === 'undefined') {
          reject(new Error('Document unavailable'));
          return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';

        input.onchange = (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) {
            reject(new Error('No file selected'));
            return;
          }

          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({
              ok: true,
              dataUrl: event.target.result,
              name: file.name,
              size: file.size,
              type: file.type
            });
          };
          reader.onerror = () => reject(new Error('Failed to read image file'));
          reader.readAsDataURL(file);
        };

        document.body.appendChild(input);
        input.click();
        setTimeout(() => {
          if (input.parentNode) input.parentNode.removeChild(input);
        }, 1000);
      });
    },

    // Web Clipboard Fallback
    copyToClipboardFallback: function(text) {
      if (typeof document === 'undefined') return false;
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      let successful = false;
      try {
        successful = document.execCommand('copy');
      } catch (err) {}
      document.body.removeChild(textArea);
      return successful;
    }
  };

  // Expose to window
  window.FallbackSystem = FallbackSystem;
  window.Fallback = FallbackSystem;
  window.iappyxFallback = FallbackSystem;

})(typeof window !== 'undefined' ? window : this);
