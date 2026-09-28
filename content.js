(() => {
  const API_KEY = 'liac_api_url';
  let activePost = null;
  let panel = null;
  let fab = null;

  const getSettings = (cb) => chrome.storage.local.get({ [API_KEY]: '' }, cb);

  function clean(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

  function findPostFromTarget(target) {
    const article = target?.closest?.('article');
    if (!article) return null;
    const text = clean(article.innerText);
    if (!text || text.length < 30) return null;
    return { article, text: text.slice(0, 12000) };
  }

  function findCommentBox(article) {
    if (!article) return null;
    const selectors = [
      '[contenteditable="true"]',
      'div[role="textbox"]',
      'textarea'
    ];
    for (const s of selectors) {
      const el = article.querySelector(s);
      if (el && el.offsetParent !== null) return el;
    }
    return document.querySelector('[contenteditable="true"], div[role="textbox"], textarea');
  }

  function setText(el, text) {
    if (!el) return false;
    el.focus();
    if (el.matches('textarea')) {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
      setter ? setter.call(el, text) : el.value = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      el.innerHTML = '';
      el.textContent = text;
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
    }
    return true;
  }

  function removePanel() { if (panel) { panel.remove(); panel = null; } }

  function renderPanel(post) {
    removePanel();
    panel = document.createElement('div'); panel.id = 'liac-panel';
    panel.style.right = '24px'; panel.style.top = '90px';
    panel.innerHTML = `
      <button class="liac-close">×</button>
      <div class="liac-title">✦ LinkedIn AI Commenter</div>
      <div class="liac-muted">Choose a style, then generate 3 comments.</div>
      <select class="liac-select" id="liac-style">
        <option value="professional">Professional</option><option value="friendly">Friendly</option>
        <option value="networking">Networking</option><option value="expert">Expert / Industry</option>
        <option value="short">Short & natural</option><option value="question">Conversation starter</option>
      </select>
      <input class="liac-input" id="liac-instruction" placeholder="Optional instruction...">
      <button id="liac-generate" style="width:100%;padding:9px;border:0;border-radius:8px;background:#0a66c2;color:#fff;font-weight:700;cursor:pointer">Generate</button>
      <div id="liac-status" class="liac-muted"></div><div id="liac-results"></div>`;
    document.body.appendChild(panel);
    panel.querySelector('.liac-close').onclick = removePanel;
    panel.querySelector('#liac-generate').onclick = async () => {
      const status = panel.querySelector('#liac-status'); const results = panel.querySelector('#liac-results');
      status.textContent = 'Generating...'; results.innerHTML = '';
      getSettings(async settings => {
        try {
          if (!settings[API_KEY]) throw new Error('Set your online API URL in extension Settings first.');
          const r = await fetch(settings[API_KEY], { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ post: post.text, style: panel.querySelector('#liac-style').value, instruction: panel.querySelector('#liac-instruction').value }) });
          if (!r.ok) throw new Error(await r.text());
          const data = await r.json();
          status.textContent = '';
          (data.comments || []).forEach(c => {
            const card = document.createElement('div'); card.className='liac-option';
            card.innerHTML = `<div class="liac-text"></div><button class="liac-use">Use this comment</button>`;
            card.querySelector('.liac-text').textContent = c;
            card.querySelector('.liac-use').onclick = () => {
              const box = findCommentBox(post.article) || document.activeElement;
              if (!setText(box, c)) { status.textContent = 'Open the LinkedIn comment box first, then click Use again.'; return; }
              status.textContent = 'Comment placed in the box. Review it and click LinkedIn Post yourself.';
            };
            results.appendChild(card);
          });
        } catch(e) { status.textContent = 'Error: ' + e.message; }
      });
    };
  }

  function addFab() {
    if (!fab) { fab = document.createElement('button'); fab.id='liac-fab'; fab.textContent='✨ AI Comment'; document.body.appendChild(fab); }
    if (!activePost) { fab.style.display='none'; return; }
    const box = findCommentBox(activePost.article);
    if (!box) { fab.style.display='none'; return; }
    const r = box.getBoundingClientRect(); fab.style.left = Math.max(10, r.left) + 'px'; fab.style.top = Math.max(10, r.top - 40) + 'px'; fab.style.display='block';
    fab.onclick = () => renderPanel(activePost);
  }

  document.addEventListener('focusin', e => { const p = findPostFromTarget(e.target); if (p) { activePost=p; setTimeout(addFab,100); } }, true);
  document.addEventListener('click', e => { const p=findPostFromTarget(e.target); if(p) { activePost=p; setTimeout(addFab,150); } }, true);
  setInterval(() => { if (activePost) addFab(); }, 1500);
})();
