(()=>{let e=null;async function t(t,s,o=""){try{return e||await async function(t,r){e=await ai.languageModel.create({...t,systemPrompt:`You are helping a user understand and answer questions about this article: "${r}".`})}(s,o),console.log("Running prompt",t),e.prompt(t)}catch(e){throw console.error("Prompt failed:",e),r(),e}}async function r(){e&&e.destroy(),e=null}chrome.runtime.onMessage.addListener(((e,s,o)=>{const n={temperature:.7,topK:5};if("get_active_tab"===e.action)return chrome.tabs.query({active:!0,currentWindow:!0},(e=>{e&&e.length>0?o({tabId:e[0].id}):o({error:"No active tab found"})})),!0;if("extract_content"===e.action)return chrome.tabs.query({active:!0,currentWindow:!0},(e=>{e[0]?.id?chrome.tabs.sendMessage(e[0].id,{action:"extract_content"},(e=>{o(e)})):o({error:"No active tab found"})})),!0;if("summarize_page"===e.action){const s=e.content;return r().then((()=>{t('Generate 5 questions and answers based on the key points of the article. \n        Structure the response like this "question: {questions} answer: {answer}" no other text or formatting.',n,s).then((e=>{const t=e.split("\n\n").map((e=>{const t=e.split("\n").map((e=>e.trim())),r=t.find((e=>e.startsWith("question:"))),s=t.find((e=>e.startsWith("answer:")));return r&&s?{question:r.replace(/^question:\s*/i,"").trim(),answer:s.replace(/^answer:\s*/i,"").trim(),userAnswer:null}:null})).filter((e=>null!==e));chrome.tabs.query({active:!0,currentWindow:!0},(e=>{if(e[0]?.url){const r=new URL(e[0].url).origin;chrome.storage.local.get("history",(e=>{const s=e.history||{};s[r]||(s[r]=[]),t.forEach((e=>{s[r].push(e)})),chrome.storage.local.set({history:s},(()=>{console.log(`History updated for ${r}:`,s[r])}))}))}})),chrome.storage.local.set({questionAnswerPairs:t},(()=>{console.log("Question answer pairs stored",t),o({success:!0,questionAnswerPairs:t})}))})).catch((e=>{console.error("Error summarizing content:",e),o({success:!1,error:e})}))})),!0}if("validate_answer"===e.action){const{question:r,userAnswer:s,index:n}=e;return async function(e,r){return t(`Under the context of the above article, score the answer to this question: "${e}" \n  with the user answer: "${r}". \n  Respond with a score between 0 and 10 based on the correctness of the answer. \n  Return in this format: "Your Score: {score}/10".\n  After that, give me a paragraph that explores the key concepts in the question in more detail. `,{temperature:.7,topK:5})}(r,s).then((e=>{chrome.tabs.query({active:!0,currentWindow:!0},(t=>{if(t[0]?.url){const e=new URL(t[0].url).origin;chrome.storage.local.get("history",(t=>{const o=t.history||{};if(o[e]){const t=o[e].find((e=>e.question===r));t&&(t.userAnswer=s)}chrome.storage.local.set({history:o},(()=>{console.log(`History updated with user answer for ${e}:`,o[e])}))}))}t[0]?.id&&chrome.tabs.sendMessage(t[0].id,{action:"display_feedback",feedback:e,index:n})})),o({success:!0})})).catch((e=>{console.error("Error validating answer:",e),o({success:!1,error:e})})),!0}if("get_history"===e.action){const{siteUrl:t}=e;return chrome.storage.local.get("history",(e=>{const r=e.history||{};o(t?{success:!0,history:r[t]||[]}:{success:!0,history:r})})),!0}return"start_highlight_mode"===e.action?(chrome.tabs.query({active:!0,currentWindow:!0},(t=>{t[0]?.id&&chrome.tabs.sendMessage(t[0].id,e,(e=>{o(e)}))})),!0):"text_highlighted"===e.action?(chrome.tabs.query({active:!0,currentWindow:!0},(t=>{t[0]?.id&&chrome.tabs.sendMessage(t[0].id,{action:"text_highlighted",text:e.text})})),!0):void 0}))})();