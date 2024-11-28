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
    startHighlightMode(message.index, true); // Answering mode
    sendResponse({ status: "Highlight mode started for answering" });
  } else if (message.action === "start_normal_highlight") {
    startHighlightMode(null, false); // Normal mode
    sendResponse({ status: "Highlight mode started for normal highlighting" });
  }
});

/*
Highlighting Logic
*/
let highlightModeActive = false;
let currentIndex = null; // Track the active index globally
let isAnswerMode = false; // Determine the highlight type

function startHighlightMode(index, answerMode) {
  highlightModeActive = true;
  currentIndex = index; // Update the active index
  isAnswerMode = answerMode; // Set the type of highlight
  document.addEventListener('mouseup', handleHighlight);
  console.log("Highlight mode activated.");
}

function stopHighlightMode() {
  highlightModeActive = false;
  currentIndex = null;
  isAnswerMode = false;
  document.removeEventListener('mouseup', handleHighlight);
  console.log("Highlight mode deactivated.");
}

// Core highlight function
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
  const fragment = createHighlightFragment(range, selectedText, xpath, true);

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
  const fragment = createHighlightFragment(range, selectedText, xpath, false);

  // Replace the original range contents with the fragment
  range.deleteContents();
  range.insertNode(fragment);

  saveHighlight(selectedText, null, xpath, false);
}

/*
Create Highlight Fragment
*/
function createHighlightFragment(range, selectedText, xpath, includeLabel) {
  const fragment = document.createDocumentFragment();

  const highlightSpan = document.createElement('span');
  highlightSpan.style.background = 'lightyellow';
  highlightSpan.style.borderRadius = '3px';
  highlightSpan.style.padding = '0 4px';
  highlightSpan.textContent = selectedText;

  if (includeLabel) {
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

    questionLabel.addEventListener('click', () => {
      const confirmDelete = confirm("Do you want to delete this highlight?");
      if (confirmDelete) {
        deleteHighlight(xpath);
        highlightSpan.remove();
        questionLabel.remove();
      }
    });

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

  return fragment;
}

/*
Persistent Highlight Storage
*/
function saveHighlight(text, questionIndex, xpath, isAnswer) {
  chrome.storage.local.get({ highlights: [] }, (result) => {
    const highlights = result.highlights;
    highlights.push({ text, questionIndex, xpath, isAnswer });
    chrome.storage.local.set({ highlights });
  });
}

function deleteHighlight(xpath) {
  chrome.storage.local.get({ highlights: [] }, (result) => {
    const highlights = result.highlights.filter(highlight => highlight.xpath !== xpath);
    chrome.storage.local.set({ highlights });
  });
}

/*
Utility Functions
*/
function getXPathForElement(element) {
  if (!element) return null;

  let node = element.nodeType === Node.TEXT_NODE ? element.parentNode : element;
  const path = [];

  while (node && node.nodeType === Node.ELEMENT_NODE) {
    let index = 0;
    let sibling = node.previousSibling;

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

function reapplyHighlights() {
  console.log("Reapplying highlights...");
  chrome.storage.local.get({ highlights: [] }, (result) => {
    const highlights = result.highlights;

    highlights.forEach(({ text, questionIndex, xpath, isAnswer }) => {
      const element = getElementByXPath(xpath);
      if (element) {
        const highlightFunction = isAnswer ? highlightForAnswering : highlightNormally;
        highlightFunction(element, text, xpath);
      }
    });
  });
}

// Reapply highlights on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', reapplyHighlights);
} else {
  reapplyHighlights();
}
