// Service workers must use self instead of window
// Chrome terminates service workers when idle — never store state in module-level variables
console.log('[Tracky] background service worker started')