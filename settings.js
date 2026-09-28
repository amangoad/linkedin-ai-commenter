const api = document.getElementById('api');
const status = document.getElementById('status');
chrome.storage.local.get({ liac_api_url: '' }, v => { api.value = v.liac_api_url || ''; });
document.getElementById('save').onclick = () => {
  const value = api.value.trim().replace(/\/$/, '');
  if (!/^https:\/\//i.test(value)) { status.textContent = 'Use an HTTPS API URL.'; return; }
  chrome.storage.local.set({ liac_api_url: value }, () => status.textContent = 'Saved.');
};
