(()=>{if(console.log("content script running"),!document.getElementById("floating-sidebar-root")){const e=document.createElement("div");e.id="floating-sidebar-root",document.body.appendChild(e)}chrome.runtime.onMessage.addListener(((i,l,s)=>{if(console.log("Message received in content script:",i),"extract_content"===i.action)s({content:function(){const e=document.querySelectorAll("article p");let t="";return e.forEach((e=>{t+=e.innerText+"\n"})),console.log("Extracted page content:",t),t}()});else if("start_highlight_mode"===i.action){const{index:l,answerMode:d}=i;!function(i,l){e=!0,t=i,n=l,document.addEventListener("mouseup",o),console.log("Highlight mode activated.")}(l,d),s({status:"Highlight mode started"})}}));let e=!1,t=null,n=!1;function o(){if(!e)return;const s=window.getSelection();if(s&&s.toString().trim()){const d=s.getRangeAt(0),r=s.toString(),c=function(e){if(!e)return null;let t=e.nodeType===Node.TEXT_NODE?e.parentNode:e;const n=[];for(;t&&t.nodeType===Node.ELEMENT_NODE;){let e=0,o=t.previousSibling;for(;o;)o.nodeType===Node.ELEMENT_NODE&&o.nodeName===t.nodeName&&e++,o=o.previousSibling;const i=t.nodeName.toLowerCase(),l=e>0?`[${e+1}]`:"";n.unshift(`${i}${l}`),t=t.parentNode}return n.length?`/${n.join("/")}`:null}(d.commonAncestorContainer);n?function(e,n,o){const s=i(e,o,!0);e.deleteContents(),e.insertNode(s),chrome.runtime.sendMessage({action:"text_highlighted",text:n,index:t}),l(n,t,o,!0)}(d,r,c):function(e,t,n){const o=i(e,n,!1);e.deleteContents(),e.insertNode(o),l(t,null,n,!1)}(d,r,c),e=!1,t=null,n=!1,document.removeEventListener("mouseup",o),console.log("Highlight mode deactivated.")}}function i(e,n,o){const i=e.cloneContents(),l=document.createDocumentFragment();return i.childNodes.forEach((e=>{if(e.nodeType===Node.TEXT_NODE){const i=document.createElement("span");if(i.style.background=o?"lightblue":"lightyellow",i.style.borderRadius="3px",i.style.padding="0 4px",i.style.marginRight="4px",i.textContent=e.textContent,o){const e=document.createElement("span");e.textContent=` [Q${t+1}]`,e.style.color="#ffffff",e.style.backgroundColor="#0078D7",e.style.borderRadius="3px",e.style.padding="0 6px",e.style.marginLeft="6px",e.style.fontSize="0.85em",e.style.fontWeight="bold",e.style.cursor="pointer",e.addEventListener("click",(()=>{if(confirm("Do you want to delete this highlight?")){const t=i.parentNode,o=i.textContent;t.replaceChild(document.createTextNode(o),i),t.removeChild(e),s(n)}})),l.appendChild(i),l.appendChild(e)}else i.addEventListener("click",(()=>{confirm("Do you want to delete this highlight?")&&(s(n),i.remove())})),l.appendChild(i)}else if(e.nodeType===Node.ELEMENT_NODE){confirm("Please Select Sentences Within the Same Paragraph.");const t=e.cloneNode(!0);highlightElementContents(t),l.appendChild(t)}})),l}function l(e,t,n,o){chrome.storage.local.get({highlights:[]},(i=>{const l=i.highlights;l.push({text:e,questionIndex:t,xpath:n,isAnswer:o}),chrome.storage.local.set({highlights:l})}))}function s(e){chrome.storage.local.get({highlights:[]},(t=>{const n=t.highlights.filter((t=>t.xpath!==e));chrome.storage.local.set({highlights:n})}))}function d(){console.log("Reapplying highlights..."),chrome.storage.local.get({highlights:[]},(e=>{e.highlights.forEach((({text:e,questionIndex:t,xpath:n,isAnswer:o})=>{const i=function(e){return(new XPathEvaluator).evaluate(e,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue}(n);i&&function(e,t,n,o,i){const l=Array.from(e.childNodes).find((e=>e.nodeType===Node.TEXT_NODE&&e.nodeValue.includes(t)));if(!l)return;const d=document.createRange(),r=l.nodeValue.indexOf(t);d.setStart(l,r),d.setEnd(l,r+t.length);const c=document.createElement("span");if(c.style.background=i?"lightblue":"lightyellow",c.style.borderRadius="3px",c.style.padding="0 4px",c.textContent=t,i){const e=document.createElement("span");e.textContent=` [Q${n+1}]`,e.style.color="#ffffff",e.style.backgroundColor="#0078D7",e.style.borderRadius="3px",e.style.padding="0 6px",e.style.marginLeft="6px",e.style.fontSize="0.85em",e.style.fontWeight="bold",e.style.cursor="pointer",e.addEventListener("click",(()=>{confirm("Do you want to delete this labelled highlight?")&&(s(o),c.remove(),e.remove())})),c.appendChild(e)}else c.addEventListener("click",(()=>{confirm("Do you want to delete this normal highlight?")&&(s(o),c.remove())}));d.deleteContents(),d.insertNode(c)}(i,e,t,n,o)}))}))}"loading"===document.readyState?document.addEventListener("DOMContentLoaded",d):d()})();