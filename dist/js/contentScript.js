(()=>{if(console.log("content script running"),!document.getElementById("floating-sidebar-root")){const e=document.createElement("div");e.id="floating-sidebar-root",document.body.appendChild(e)}chrome.runtime.onMessage.addListener(((o,i,d)=>{if(console.log("Message received in content script:",o),"extract_content"===o.action)d({content:function(){const e=document.querySelectorAll("article p");let t="";return e.forEach((e=>{t+=e.innerText+"\n"})),console.log("Extracted page content:",t),t}()});else if("start_highlight_mode"===o.action){const{index:i}=o;!function(o){e=!0,t=o,document.addEventListener("mouseup",n),console.log("Highlight mode activated.")}(i),d({status:"Highlight mode started"})}}));let e=!1,t=null;function n(){if(!e)return;const o=window.getSelection();if(o&&o.toString().trim()){const i=o.getRangeAt(0),d=o.toString(),l=i.cloneContents(),c=document.createDocumentFragment();l.childNodes.forEach((e=>{if(e.nodeType===Node.TEXT_NODE){const n=document.createElement("span");n.style.background="lightblue",n.style.borderRadius="3px",n.style.padding="0 4px",n.style.marginRight="4px",n.textContent=e.textContent;const o=document.createElement("span");o.textContent=` [Q${t+1}]`,o.style.color="#ffffff",o.style.backgroundColor="#0078D7",o.style.borderRadius="3px",o.style.padding="0 6px",o.style.marginLeft="6px",o.style.fontSize="0.85em",o.style.fontWeight="bold",c.appendChild(n),c.appendChild(o)}else if(e.nodeType===Node.ELEMENT_NODE){const t=e.cloneNode(!0);highlightElementContents(t),c.appendChild(t)}})),i.deleteContents(),i.insertNode(c),chrome.runtime.sendMessage({action:"text_highlighted",text:d,index:t}),e=!1,t=null,document.removeEventListener("mouseup",n),console.log("Highlight mode deactivated.")}}})();