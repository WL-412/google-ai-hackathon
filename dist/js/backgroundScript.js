chrome.runtime.onMessage.addListener(((e,n,o)=>{"open_panel"===e.action&&chrome.action.openPopup()}));