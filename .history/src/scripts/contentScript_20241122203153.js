console.log("content script running");

if (!document.getElementById('floating-sidebar-root')) {
  const rootElement = document.createElement('div');
  rootElement.id = 'floating-sidebar-root';
  document.body.appendChild(rootElement);
}

let highlightModeActive = false;

function startHighlightMode() {
  highlightModeActive = true;
  document.addEventListener('mouseup', handleHighlight);
  console.log("Highlight mode activated.");
}

function stopHighlightMode() {
  highlightModeActive = false;
  document.removeEventListener('mouseup', handleHighlight);
  console.log("Highlight mode deactivated.");
}

function handleHighlight() {
  if (!highlightModeActive) return;

  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    const selectedText = selection.toString();
    console.log("Highlighted text:", selectedText);

    // Apply custom highlight style
    const range = selection.getRangeAt(0);
    const highlightSpan = document.createElement('span');
    highlightSpan.style.background = 'lightblue';
    highlightSpan.style.borderRadius = '3px';
    highlightSpan.textContent = selectedText;
    range.deleteContents();
    range.insertNode(highlightSpan);

    // Send the selected text back to the extension
    chrome.runtime.sendMessage({ action: "text_highlighted", text: selectedText });
    stopHighlightMode();
  }
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'start_highlight_mode') {
    startHighlightMode();
    sendResponse({ status: 'Highlight mode started' });
  }
});
