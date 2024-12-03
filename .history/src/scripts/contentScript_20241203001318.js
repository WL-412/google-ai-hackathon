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
      confirm("Please Select Sentences Within the Same Paragraph.");
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

function reapplyHighlights() {
  console.log("Reapplying highlights...");
  chrome.storage.local.get({ highlights: [] }, (result) => {
    const highlights = result.highlights;

    highlights.forEach(({ text, questionIndex, xpath, isAnswer }) => {
      const element = getElementByXPath(xpath);
      if (element) {
        // Apply the specific highlight
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

// Similar to highlight creation
function highlightTextInElement(element, text, questionIndex, xpath, isAnswer) {
  // Find the text node containing the target text
  const textNode = Array.from(element.childNodes).find(
    (node) => node.nodeType === Node.TEXT_NODE && node.nodeValue.includes(text)
  );

  if (!textNode) return;

  // Create a Range to isolate the target text
  const range = document.createRange();
  const startIndex = textNode.nodeValue.indexOf(text);
  range.setStart(textNode, startIndex);
  range.setEnd(textNode, startIndex + text.length);

  // Wrap the target text in a highlight span
  const highlightSpan = document.createElement('span');
  highlightSpan.style.background = isAnswer ? 'lightblue' : 'lightyellow';
  highlightSpan.style.borderRadius = '3px';
  highlightSpan.style.padding = '0 4px';
  highlightSpan.textContent = text;

  // Add deletion logic based on type
  if (isAnswer) {
    const label = document.createElement('span');
    label.textContent = ` [Q${questionIndex + 1}]`;
    label.style.color = '#ffffff';
    label.style.backgroundColor = '#0078D7';
    label.style.borderRadius = '3px';
    label.style.padding = '0 6px';
    label.style.marginLeft = '6px';
    label.style.fontSize = '0.85em';
    label.style.fontWeight = 'bold';
    label.style.cursor = 'pointer';

    // Attach deletion logic to the label
    label.addEventListener('click', () => {
      const confirmDelete = confirm("Do you want to delete this labelled highlight?");
      if (confirmDelete) {
        deleteHighlight(xpath);
        highlightSpan.remove();
        label.remove();
      }
    });

    highlightSpan.appendChild(label);
  } else {
    // Attach deletion logic for normal highlights
    highlightSpan.addEventListener('click', () => {
      const confirmDelete = confirm("Do you want to delete this normal highlight?");
      if (confirmDelete) {
        deleteHighlight(xpath);
        highlightSpan.remove();
      }
    });
  }

  // Replace the range with the highlight span
  range.deleteContents();
  range.insertNode(highlightSpan);
}




// Reapply highlights when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', reapplyHighlights);
} else {
  reapplyHighlights();
}
