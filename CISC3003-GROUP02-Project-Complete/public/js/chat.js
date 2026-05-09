(function () {
  const ns = (window.cornerstone = window.cornerstone || {});
  const state = {
    messages: [
      {
        role: 'assistant',
        content:
          'Hello! I am Cornerstone AI. Ask about programmes, jobs, My List, or the Cornerstone site.'
      }
    ],
    sending: false
  };

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatMessage(str) {
    return escapeHtml(str).replace(/\n/g, '<br>');
  }

  function setStatus(text) {
    const el = document.querySelector('[data-chat-status]');
    if (el) el.textContent = text;
  }

  function renderThread() {
    const thread = document.querySelector('[data-chat-thread]');
    if (!thread) return;

    thread.innerHTML = state.messages
      .map(
        (message) => `
          <article class="chat-message is-${message.role}">
            <div class="chat-bubble">
              <p>${formatMessage(message.content)}</p>
            </div>
          </article>
        `
      )
      .join('');

    thread.scrollTop = thread.scrollHeight;
  }

  function setSending(sending) {
    state.sending = sending;
    const input = document.querySelector('[data-chat-input]');
    const button = document.querySelector('[data-chat-send]');
    if (input) input.disabled = sending;
    if (button) {
      button.disabled = sending;
      button.textContent = sending ? 'Sending...' : 'Send';
    }
  }

  function appendMessage(role, content) {
    state.messages.push({ role, content });
    renderThread();
  }

  function resetChat() {
    state.messages = [state.messages[0]];
    renderThread();
    setStatus('Ready for POST /api/chat');
  }

  async function sendMessage(text) {
    const question = String(text || '').trim();
    if (!question || state.sending) return;

    appendMessage('user', question);
    setSending(true);
    setStatus('Waiting for backend reply...');

    try {
      const response = await ns.api.post('/api/chat', {
        messages: state.messages.map((message) => ({
          role: message.role,
          content: message.content
        }))
      });

      const reply = response && typeof response.reply === 'string' ? response.reply.trim() : '';
      if (!reply) {
        throw new Error('The chat backend returned no reply.');
      }

      appendMessage('assistant', reply);
      setStatus('Reply received');
    } catch (err) {
      const isMissingRoute = err.status === 404;
      const isUnauthorized = err.status === 401;
      const message = isMissingRoute
        ? 'POST /api/chat is not connected yet.'
        : isUnauthorized
          ? 'Please sign in again to use the AI chat.'
          : err.message;
      appendMessage('assistant', message);
      ns.toast(message, 'error');
      setStatus(isUnauthorized ? 'Sign-in required' : 'Backend not ready');
    } finally {
      setSending(false);
      const input = document.querySelector('[data-chat-input]');
      if (input) input.focus();
    }
  }

  function gate(user) {
    const signedOut = document.querySelector('[data-chat-signed-out]');
    const authed = document.querySelector('[data-chat-authed]');
    if (user) {
      if (signedOut) signedOut.hidden = true;
      if (authed) authed.hidden = false;
      renderThread();
    } else {
      if (signedOut) signedOut.hidden = false;
      if (authed) authed.hidden = true;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!document.body.classList.contains('page-chat')) return;

    ns.onSession(gate);

    const form = document.querySelector('[data-chat-form]');
    const input = document.querySelector('[data-chat-input]');
    const resetButton = document.querySelector('[data-chat-reset]');

    if (form && input) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const text = input.value;
        input.value = '';
        await sendMessage(text);
      });
    }

    if (resetButton) {
      resetButton.addEventListener('click', () => {
        resetChat();
        ns.toast('Started a new chat');
      });
    }

    document.querySelectorAll('[data-chat-prompt]').forEach((button) => {
      button.addEventListener('click', async () => {
        const prompt = button.getAttribute('data-chat-prompt') || '';
        if (input) input.value = '';
        await sendMessage(prompt);
      });
    });
  });
})();
