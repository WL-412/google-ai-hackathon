
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'open_panel') {
    // Open the panel (or popup) by creating a new tab or using `chrome.action`
    chrome.action.openPopup(); // This will open the popup defined in the manifest
  }
});