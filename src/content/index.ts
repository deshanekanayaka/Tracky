// This runs inside the job listing page's context
// It can read document.querySelector but CANNOT access chrome.storage or call fetch to Sheets API
console.log('[Tracky] content script active on', window.location.hostname)