// Example content script
console.log("Content script is running!");

// Example: Inject a placeholder div
const placeholder = document.createElement('div');
placeholder.id = 'my-extension-placeholder';
placeholder.style.position = 'fixed';
placeholder.style.bottom = '20px';
placeholder.style.right = '20px';
placeholder.style.padding = '10px';
placeholder.style.backgroundColor = '#fff';
placeholder.style.border = '1px solid #ccc';
placeholder.style.cursor = 'pointer';
placeholder.innerText = 'Open Panel';
document.body.appendChild(placeholder);

// Handle click to communicate with the background or React panel
placeholder.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'open_panel' });
});
