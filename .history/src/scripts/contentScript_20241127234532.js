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
    const { index, answerMode: answerMode } = message;
    startHighlightMode(index, answerMode);
    sendResponse({ status: "Highlight mode started" });
  }
});

/*
Highlighting Logic
*/
let highlightModeActive = false;
let currentIndex = null; // Track the active index globally
let isAnswerMode = false;

function startHighlightMode(index, answerMode) {
  highlightModeActive = true;
  currentIndex = index; // Update the active index
  isAnswerMode = answerMode; // Set the type of highlight
  document.addEventListener('mouseup', handleHighlight);
  console.log("Highlight mode activated.");
}

function stopHighlightMode() {
  highlightModeActive = false;
  currentIndex = null; // Clear the active index
  isAnswerMode = false;
  document.removeEventListener('mouseup', handleHighlight);
  console.log("Highlight mode deactivated.");
}

// Function to handle text highlighting
function handleHighlight() {
  if (!highlightModeActive) return;

  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();

    const xpath = getXPathForElement(range.commonAncestorContainer);

    if (isAnswerMode) {
      highlightForAnswering(range, selectedText, xpath);
    } else {
      highlightNormally(range, selectedText, xpath);
    }

    stopHighlightMode();
  }
}

/*
Answer Highlight Logic
*/
function highlightForAnswering(range, selectedText, xpath) {
  const fragment = createHighlightFragment(range, xpath, true);

  // Replace the original range contents with the fragment
  range.deleteContents();
  range.insertNode(fragment);

  chrome.runtime.sendMessage({ action: "text_highlighted", text: selectedText, index: currentIndex });
  saveHighlight(selectedText, currentIndex, xpath, true);
}

/*
Normal Highlight Logic
*/
function highlightNormally(range, selectedText, xpath) {
  const fragment = createHighlightFragment(range, xpath, false);

  // Replace the original range contents with the fragment
  range.deleteContents();
  range.insertNode(fragment);

  saveHighlight(selectedText, null, xpath, false);
}

/*
Create Highlight Fragment
*/
function createHighlightFragment(range, xpath, includeLabel) {
  // Clone the selected content while preserving structure
  const originalContents = range.cloneContents();

  // Create a DocumentFragment to hold the processed content
  const fragment = document.createDocumentFragment();

  originalContents.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      // For plain text nodes, wrap them in a highlight span
      const highlightSpan = document.createElement('span');
      highlightSpan.style.background = includeLabel ? 'lightblue' : 'lightyellow';
      highlightSpan.style.borderRadius = '3px';
      highlightSpan.style.padding = '0 4px';
      highlightSpan.style.marginRight = '4px';
      highlightSpan.textContent = node.textContent;

      if (includeLabel) {
        // Create a question number label with deletion logic
        const questionLabel = document.createElement('span');
        questionLabel.textContent = ` [Q${currentIndex + 1}]`;
        questionLabel.style.color = '#ffffff';
        questionLabel.style.backgroundColor = '#0078D7';
        questionLabel.style.borderRadius = '3px';
        questionLabel.style.padding = '0 6px';
        questionLabel.style.marginLeft = '6px';
        questionLabel.style.fontSize = '0.85em';
        questionLabel.style.fontWeight = 'bold';
        questionLabel.style.cursor = 'pointer';

        // Add event listener to handle deletion
        questionLabel.addEventListener('click', () => {
          const confirmDelete = confirm("Do you want to delete this highlight?");
          if (confirmDelete) {
            // Remove the highlight and restore the original text
            const parent = highlightSpan.parentNode;
            const originalText = highlightSpan.textContent;
            parent.replaceChild(document.createTextNode(originalText), highlightSpan);
            parent.removeChild(questionLabel);

            // Remove the highlight from storage
            deleteHighlight(xpath);
          }
        });

        // Append both the highlighted span and the question label
        fragment.appendChild(highlightSpan);
        fragment.appendChild(questionLabel);
      } else {
        highlightSpan.addEventListener('click', () => {
          const confirmDelete = confirm("Do you want to delete this highlight?");
          if (confirmDelete) {
            deleteHighlight(xpath);
            highlightSpan.remove();
          }
        });
        fragment.appendChild(highlightSpan);
      }

    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // For element nodes, preserve their structure and process their children
      const clonedElement = node.cloneNode(true);
      highlightElementContents(clonedElement);
      fragment.appendChild(clonedElement);
    }
  });

  return fragment
}

// Store highlights persistently in Chrome storage
function saveHighlight(text, questionIndex, xpath, isAnswer) {
  chrome.storage.local.get({ highlights: [] }, (result) => {
    const highlights = result.highlights;
    highlights.push({ text, questionIndex, xpath, isAnswer });
    chrome.storage.local.set({ highlights });
  });
}

// Delete a highlight from Chrome storage
function deleteHighlight(xpath) {
  chrome.storage.local.get({ highlights: [] }, (result) => {
    const highlights = result.highlights.filter(highlight => highlight.xpath !== xpath);
    chrome.storage.local.set({ highlights });
  });
}

// Reapply highlights on page load
function reapplyHighlights() {

  chrome.storage.local.get({ highlights: [] }, (result) => {
    const highlights = result.highlights;

    highlights.forEach(({ text, questionIndex, xpath, isAnswer }) => {
      const element = getElementByXPath(xpath);
      if (element) {
        highlightTextInElement(element, text, questionIndex, xpath, isAnswer);
      }
    });
  });
}

// Utility to get XPath of an element
function getXPathForElement(element) {
  if (!element) return null;

  let node = element.nodeType === Node.TEXT_NODE ? element.parentNode : element;
  const path = [];

  while (node && node.nodeType === Node.ELEMENT_NODE) {
    let index = 0;
    let sibling = node.previousSibling;

    // Count previous siblings of the same node type
    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === node.nodeName) {
        index++;
      }
      sibling = sibling.previousSibling;
    }

    const tagName = node.nodeName.toLowerCase();
    const nth = index > 0 ? `[${index + 1}]` : '';
    path.unshift(`${tagName}${nth}`);
    node = node.parentNode;
  }

  return path.length ? `/${path.join('/')}` : null;
}

// Utility to find element by XPath
function getElementByXPath(xpath) {
  const evaluator = new XPathEvaluator();
  const result = evaluator.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );
  return result.singleNodeValue;
}

// Highlight text in a specific element
function highlightTextInElement(element, text, questionIndex, xpath, isAnswer) {
  const range = document.createRange();
  const startOffset = element.innerHTML.indexOf(text);
  const endOffset = startOffset + text.length;

  if (startOffset === -1) return; // Text not found in element

  // Create a unique identifier for the highlight
  const highlightId = `highlight-${Date.now()}-${Math.random()}`;

  range.setStart(element.firstChild, startOffset);
  range.setEnd(element.firstChild, endOffset);

  const fragment = document.createDocumentFragment();

  // Create highlight span
  const highlightSpan = document.createElement('span');
  highlightSpan.style.background = isAnswer ? 'lightblue' : 'lightyellow';
  highlightSpan.style.borderRadius = '3px';
  highlightSpan.style.padding = '0 4px';
  highlightSpan.setAttribute('data-id', highlightId); // Unique ID
  highlightSpan.textContent = text;

  // Append highlight span to the fragment
  fragment.appendChild(highlightSpan);

  if (isAnswer) {
    // Create label for answer highlights
    const questionLabel = document.createElement('span');
    questionLabel.textContent = ` [Q${questionIndex + 1}]`;
    questionLabel.style.color = '#ffffff';
    questionLabel.style.backgroundColor = '#0078D7';
    questionLabel.style.borderRadius = '3px';
    questionLabel.style.padding = '0 6px';
    questionLabel.style.marginLeft = '6px';
    questionLabel.style.fontSize = '0.85em';
    questionLabel.style.fontWeight = 'bold';
    questionLabel.style.cursor = 'pointer';
    questionLabel.setAttribute('data-id', highlightId); // Same ID as highlight span

    // Add deletion logic for the label
    questionLabel.addEventListener('click', () => {
      const confirmDelete = confirm("Do you want to delete this highlight?");
      if (confirmDelete) {
        deleteHighlight(xpath);
        removeHighlightById(highlightId);
      }
    });

    fragment.appendChild(questionLabel);
  } else {
    // Add deletion logic for normal highlight
    highlightSpan.addEventListener('click', () => {
      const confirmDelete = confirm("Do you want to delete this highlight?");
      if (confirmDelete) {
        deleteHighlight(xpath);
        removeHighlightById(highlightId);
      }
    });
  }

  // Replace range with the fragment
  range.deleteContents();
  range.insertNode(fragment);
}

// Utility to remove highlights by unique ID
function removeHighlightById(highlightId) {
  const highlights = document.querySelectorAll(`[data-id="${highlightId}"]`);
  highlights.forEach((node) => node.remove());
}

// Updated reapplyHighlights to handle unique identifiers
function reapplyHighlights() {
  console.log("Reapplying highlights...");
  chrome.storage.local.get({ highlights: [] }, (result) => {
    const highlights = result.highlights;

    highlights.forEach(({ text, questionIndex, xpath, isAnswer }) => {
      const element = getElementByXPath(xpath);
      if (element) {
        highlightTextInElement(element, text, questionIndex, xpath, isAnswer);
      }
    });
  });
}




// Reapply highlights when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', reapplyHighlights);
} else {
  reapplyHighlights();
}
