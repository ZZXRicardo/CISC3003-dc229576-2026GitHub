// Shared fetch wrapper for the Cornerstone API.
(function () {
  async function request(method, url, body) {
    const options = {
      method,
      credentials: 'same-origin',
      headers: {}
    };
    if (body !== undefined) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
    const res = await fetch(url, options);
    const text = await res.text();
    let data = null;
    if (text) {
      try { data = JSON.parse(text); } catch { data = { raw: text }; }
    }
    if (!res.ok) {
      const err = new Error((data && data.error) || `Request failed (${res.status})`);
      err.status = res.status;
      err.body = data;
      throw err;
    }
    return data;
  }

  const api = {
    get: (url) => request('GET', url),
    post: (url, body) => request('POST', url, body || {}),
    put: (url, body) => request('PUT', url, body || {}),
    del: (url, body) => request('DELETE', url, body || {})
  };

  function toast(message, variant) {
    let stack = document.querySelector('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      stack.setAttribute('aria-live', 'polite');
      stack.setAttribute('aria-atomic', 'true');
      document.body.appendChild(stack);
    }
    const el = document.createElement('div');
    el.className = 'toast' + (variant ? ' is-' + variant : '');
    el.textContent = message;
    stack.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  window.cornerstone = window.cornerstone || {};
  window.cornerstone.api = api;
  window.cornerstone.toast = toast;
})();
