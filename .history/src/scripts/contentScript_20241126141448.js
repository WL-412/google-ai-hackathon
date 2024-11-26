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
    const { index } = message;
    startHighlightMode(index);
    sendResponse({ status: "Highlight mode started" });
  }
});




/*
Logic for Highlight Pen is Below
*/
let highlightModeActive = false;
let currentIndex = null; // Track the active index globally

function startHighlightMode(index) {
  highlightModeActive = true;
  currentIndex = index; // Update the active index
  document.addEventListener('mouseup', handleHighlight);
  console.log("Highlight mode activated.");
}

function stopHighlightMode() {
  highlightModeActive = false;
  currentIndex = null; // Clear the active index
  document.removeEventListener('mouseup', handleHighlight);
  console.log("Highlight mode deactivated.");
}

function handleHighlight(index) {
  if (!highlightModeActive) return;

  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    const range = selection.getRangeAt(0);

    // Clone the range to avoid modifying the original selection during processing
    const clonedRange = range.cloneRange();

    // Process each selected element within the range
    const commonAncestor = range.commonAncestorContainer;

    const walker = document.createTreeWalker(
      commonAncestor,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Only process text nodes that are partially or fully selected
          return clonedRange.intersectsNode(node)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        },
      }
    );

    const highlightedNodes = [];
    while (walker.nextNode()) {
      const currentTextNode = walker.currentNode;

      // Determine the part of the text to highlight
      const startOffset =
        currentTextNode === range.startContainer ? range.startOffset : 0;
      const endOffset =
        currentTextNode === range.endContainer
          ? range.endOffset
          : currentTextNode.textContent.length;

      const selectedText = currentTextNode.textContent.slice(
        startOffset,
        endOffset
      );

      // Create a highlight span for the selected text
      const highlightSpan = document.createElement("span");
      highlightSpan.style.background = "lightblue";
      highlightSpan.style.borderRadius = "3px";
      highlightSpan.textContent = selectedText;

      // Split the text node and insert the highlight span
      const beforeText = currentTextNode.textContent.slice(0, startOffset);
      const afterText = currentTextNode.textContent.slice(endOffset);

      if (beforeText) {
        currentTextNode.textContent = beforeText;
        currentTextNode.parentNode.insertBefore(
          highlightSpan,
          currentTextNode.nextSibling
        );
      } else {
        currentTextNode.replaceWith(highlightSpan);
      }

      if (afterText) {
        const afterNode = document.createTextNode(afterText);
        highlightSpan.parentNode.insertBefore(afterNode, highlightSpan.nextSibling);
      }

      highlightedNodes.push(selectedText);
    }

    // Send the highlighted text back to the extension
    chrome.runtime.sendMessage({
      action: "text_highlighted",
      text: highlightedNodes.join(" "),
      index: index,
    });

    // Clear the selection and exit highlight mode
    window.getSelection().removeAllRanges();
    stopHighlightMode();
  }
}
