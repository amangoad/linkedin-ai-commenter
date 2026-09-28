async function getActiveTab(){ const [tab]=await chrome.tabs.query({active:true,currentWindow:true}); return tab; }
const status=document.getElementById('status'), results=document.getElementById('results');
document.getElementById('generate').onclick=async()=>{
  status.textContent='Reading LinkedIn post...'; results.innerHTML='';
  const tab=await getActiveTab();
  if(!tab?.url?.includes('linkedin.com')){status.textContent='Open LinkedIn first.';return;}
  try{
    const [{result}] = await chrome.scripting?.executeScript ? chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>{const a=document.activeElement?.closest?.('article')||document.querySelector('article');return a?.innerText||'';}}) : [];
    if(!result) throw new Error('Could not read the post. Use the ✨ button beside the comment box instead.');
  }catch(e){ status.textContent=e.message; }
};
// Popup cannot use scripting permission in this minimal manifest. The content script owns the full workflow.
status.textContent='Open a LinkedIn post and click inside its comment box. The ✨ AI Comment button will appear.';
