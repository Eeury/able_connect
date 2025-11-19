// Styled Alert System for Able Connect

/**
 * Show a styled alert message
 * @param {string} message - The message to display
 * @param {string} type - Alert type: 'success', 'error', 'warning', 'info' (default: 'info')
 * @param {number} duration - Auto-close duration in milliseconds (0 = no auto-close, default: 4000)
 */
function showAlert(message, type = 'info', duration = 4000) {
  // Remove any existing alerts first
  const existingAlerts = document.querySelectorAll('.styled-alert');
  existingAlerts.forEach(alert => {
    alert.classList.add('alert-fade-out');
    setTimeout(() => alert.remove(), 300);
  });

  // Create alert element
  const alert = document.createElement('div');
  alert.className = `styled-alert alert-${type}`;
  alert.setAttribute('role', 'alert');
  alert.setAttribute('aria-live', 'polite');

  // Icon based on type
  let icon = '';
  switch (type) {
    case 'success':
      icon = '✓';
      break;
    case 'error':
      icon = '✕';
      break;
    case 'warning':
      icon = '⚠';
      break;
    case 'info':
    default:
      icon = 'ℹ';
      break;
  }

  alert.innerHTML = `
    <div class="alert-content">
      <span class="alert-icon">${icon}</span>
      <span class="alert-message">${escapeHtml(message)}</span>
      <button class="alert-close" onclick="this.parentElement.parentElement.remove()" aria-label="Close alert">×</button>
    </div>
  `;

  // Add to body
  document.body.appendChild(alert);

  // Trigger animation
  setTimeout(() => {
    alert.classList.add('alert-show');
  }, 10);

  // Auto-close if duration is set
  if (duration > 0) {
    setTimeout(() => {
      alert.classList.add('alert-fade-out');
      setTimeout(() => {
        if (alert.parentElement) {
          alert.remove();
        }
      }, 300);
    }, duration);
  }

  // Make it accessible
  alert.focus();
}

/**
 * Show success alert
 */
function showSuccessAlert(message, duration = 4000) {
  showAlert(message, 'success', duration);
}

/**
 * Show error alert
 */
function showErrorAlert(message, duration = 5000) {
  showAlert(message, 'error', duration);
}

/**
 * Show warning alert
 */
function showWarningAlert(message, duration = 4000) {
  showAlert(message, 'warning', duration);
}

/**
 * Show info alert
 */
function showInfoAlert(message, duration = 4000) {
  showAlert(message, 'info', duration);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Make functions globally available
window.showAlert = showAlert;
window.showSuccessAlert = showSuccessAlert;
window.showErrorAlert = showErrorAlert;
window.showWarningAlert = showWarningAlert;
window.showInfoAlert = showInfoAlert;

