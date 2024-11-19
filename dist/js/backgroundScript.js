(()=>{let e=null;async function t(t,r,s=""){try{return e||await async function(t,n){e=await ai.languageModel.create({...t,systemPrompt:`You are helping a user understand and answer questions about this article: "${n}".`})}(r,s),console.log("Running prompt",t),e.prompt(t)}catch(e){throw console.error("Prompt failed:",e),n(),e}}async function n(){e&&e.destroy(),e=null}chrome.runtime.onMessage.addListener(((e,r,s)=>{const o={temperature:.7,topK:5};if("get_active_tab"===e.action)return chrome.tabs.query({active:!0,currentWindow:!0},(e=>{e&&e.length>0?s({tabId:e[0].id}):s({error:"No active tab found"})})),!0;if("extract_content"===e.action)return chrome.tabs.query({active:!0,currentWindow:!0},(e=>{e[0]?.id?chrome.tabs.sendMessage(e[0].id,{action:"extract_content"},(e=>{s(e)})):s({error:"No active tab found"})})),!0;if("summarize_page"===e.action){const r=e.content;return n().then((()=>{t('Generate 5 questions and answers based on the key points of the article. \n        Structure the response like this "question: {questions} answer: {answer}" no other text or formatting.',o,r).then((e=>{const t=e.split("\n\n").map((e=>{const t=e.split("\n").map((e=>e.trim())),n=t.find((e=>e.startsWith("question:"))),r=t.find((e=>e.startsWith("answer:")));return n&&r?{question:n.replace(/^question:\s*/i,"").trim(),answer:r.replace(/^answer:\s*/i,"").trim()}:null})).filter((e=>null!==e));chrome.storage.local.set({questionAnswerPairs:t},(()=>{console.log("Question answer pairs stored",t),s({success:!0,questionAnswerPairs:t})}))})).catch((e=>{console.error("Error summarizing content:",e),s({success:!1,error:e})}))})),!0}if("validate_answer"===e.action){const{question:n,userAnswer:r,index:o}=e;return async function(e,n){return t(`Under the context of the above article, score the answer to this question: "${e}" \n  with the user answer: "${n}". \n  Respond with a score between 0 and 10 based on the correctness of the answer. \n  Return in this format: "Your Score: {score}/10"`,{temperature:.7,topK:5})}(n,r).then((e=>{chrome.tabs.query({active:!0,currentWindow:!0},(t=>{t[0]?.id&&chrome.tabs.sendMessage(t[0].id,{action:"display_feedback",feedback:e,index:o})})),s({success:!0})})).catch((e=>{console.error("Error validating answer:",e),s({success:!1,error:e})})),!0}}))})();