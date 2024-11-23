// contentScript.js

console.log("content script running");

if (!document.getElementById('floating-sidebar-root')) {
  const rootElement = document.createElement('div');
  rootElement.id = 'floating-sidebar-root';
  document.body.appendChild(rootElement);
}

// Extract text content from <p> tags
function extractPageContent() {
  const paragraphs = document.querySelectorAll('article p');
  let content = '';
  paragraphs.forEach((p) => {
    content += p.innerText + '\n';
  });
  console.log("Extracted page content:", content);
  return content;
}

// Listen for messages from the sidebar
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in content script:", message);

  if (message.action === "extract_content") {
    const content = extractPageContent();
    sendResponse({ content });
  } else if (message.action === "start_highlight_mode") {
    startHighlightMode(message.index);
    sendResponse({ status: "Highlight mode started" });
  }
});


let highlightModeActive = false;

function startHighlightMode(index) {
  highlightModeActive = true;
  console.log("reached start highlight mode");
  document.addEventListener('mouseup', handleHighlight(index));
  console.log("Highlight mode activated.");
}

function stopHighlightMode() {
  highlightModeActive = false;
  document.removeEventListener('mouseup', handleHighlight);
  console.log("Highlight mode deactivated.");
}

function handleHighlight(index) {
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
    console.log("Reached handle highlight");
    chrome.runtime.sendMessage({ action: "text_highlighted", text: selectedText, index: index });
    stopHighlightMode();
  }
}