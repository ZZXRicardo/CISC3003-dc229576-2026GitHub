// Handles signup/login/forgot/reset/verify-code forms.
(function () {
  const ns = (window.cornerstone = window.cornerstone || {});
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showFeedback(form, message, kind) {
    let box = form.querySelector('.form-feedback');
    if (!box) {
      box = document.createElement('div');
      box.className = 'form-feedback';
      form.insertBefore(box, form.firstChild);
    }
    box.textContent = message;
    box.className = 'form-feedback is-' + kind;
    const pageStatus = document.querySelector('[data-verify-status]');
    if (pageStatus) {
      pageStatus.textContent = message;
      pageStatus.className = 'verify-status is-' + kind;
      pageStatus.hidden = false;
    }
  }

  function lock(form, locked) {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    if (!btn.dataset.label) btn.dataset.label = btn.textContent;
    btn.disabled = locked;
    btn.textContent = locked ? 'Working...' : btn.dataset.label;
  }

  function qs(key) {
    return new URLSearchParams(window.location.search).get(key);
  }

  async function handleSignup(form) {
    const email = form.querySelector('[name="email"]').value.trim();
    const password = form.querySelector('[name="password"]').value;
    const confirm = form.querySelector('[name="confirm"]').value;
    const displayName = form.querySelector('[name="displayName"]').value.trim();
    if (!EMAIL_RE.test(email)) return showFeedback(form, 'Please enter a valid email.', 'error');
    if (password.length < 8) return showFeedback(form, 'Password must be at least 8 characters.', 'error');
    if (password !== confirm) return showFeedback(form, 'Passwords do not match.', 'error');

    lock(form, true);
    try {
      const res = await ns.api.post('/api/auth/signup', { email, password, displayName });
      showFeedback(form, res.message || 'Check your email for a verification link or code.', 'success');
      setTimeout(() => {
        window.location.href = '/verify.html?email=' + encodeURIComponent(email);
      }, 700);
    } catch (err) {
      showFeedback(form, err.message, 'error');
    } finally {
      lock(form, false);
    }
  }

  async function handleLogin(form) {
    const email = form.querySelector('[name="email"]').value.trim();
    const password = form.querySelector('[name="password"]').value;
    if (!EMAIL_RE.test(email)) return showFeedback(form, 'Please enter a valid email.', 'error');
    if (!password) return showFeedback(form, 'Password is required.', 'error');

    lock(form, true);
    try {
      await ns.api.post('/api/auth/login', { email, password });
      showFeedback(form, 'Signed in. Redirecting...', 'success');
      const redirect = qs('redirect') || '/account.html';
      setTimeout(() => (window.location.href = redirect), 500);
    } catch (err) {
      showFeedback(form, err.message, 'error');
    } finally {
      lock(form, false);
    }
  }

  async function handleForgot(form) {
    const email = form.querySelector('[name="email"]').value.trim();
    if (!EMAIL_RE.test(email)) return showFeedback(form, 'Please enter a valid email.', 'error');

    lock(form, true);
    try {
      const res = await ns.api.post('/api/auth/forgot', { email });
      showFeedback(
        form,
        res.message || 'If the email exists, a reset email has been sent. Redirecting to the reset page...',
        'success'
      );
      setTimeout(() => {
        window.location.href = '/reset.html?email=' + encodeURIComponent(email);
      }, 700);
    } catch (err) {
      showFeedback(form, err.message, 'error');
    } finally {
      lock(form, false);
    }
  }

  async function handleReset(form) {
    const token = qs('token');
    const email = form.querySelector('[name="email"]').value.trim();
    const code = form.querySelector('[name="code"]').value.trim();
    const newPassword = form.querySelector('[name="newPassword"]').value;
    const confirm = form.querySelector('[name="confirm"]').value;
    if (newPassword.length < 8) return showFeedback(form, 'Password must be at least 8 characters.', 'error');
    if (newPassword !== confirm) return showFeedback(form, 'Passwords do not match.', 'error');
    if (!token) {
      if (!EMAIL_RE.test(email)) return showFeedback(form, 'Please enter a valid email.', 'error');
      if (!/^\d{6}$/.test(code)) return showFeedback(form, 'Please enter the 6-digit reset code.', 'error');
    }

    lock(form, true);
    try {
      const payload = token
        ? { token, newPassword }
        : { email, code, newPassword };
      const res = await ns.api.post('/api/auth/reset', payload);
      showFeedback(form, res.message || 'Password updated. Redirecting to login...', 'success');
      setTimeout(() => (window.location.href = '/login.html'), 900);
    } catch (err) {
      showFeedback(form, err.message, 'error');
    } finally {
      lock(form, false);
    }
  }

  async function handleVerifyCode(form) {
    const email = form.querySelector('[name="email"]').value.trim();
    const code = form.querySelector('[name="code"]').value.trim();
    if (!EMAIL_RE.test(email)) return showFeedback(form, 'Please enter a valid email.', 'error');
    if (!/^\d{6}$/.test(code)) return showFeedback(form, 'Please enter the 6-digit verification code.', 'error');

    lock(form, true);
    try {
      const res = await ns.api.post('/api/auth/verify-code', { email, code });
      showFeedback(form, res.message || 'Email verified successfully.', 'success');
      setTimeout(() => (window.location.href = '/login.html'), 900);
    } catch (err) {
      showFeedback(form, err.message, 'error');
    } finally {
      lock(form, false);
    }
  }

  async function handleResendVerification(form) {
    const email = form.querySelector('[name="email"]').value.trim();
    if (!EMAIL_RE.test(email)) return showFeedback(form, 'Please enter a valid email.', 'error');

    lock(form, true);
    try {
      const res = await ns.api.post('/api/auth/resend-verification', { email });
      showFeedback(form, res.message || 'A new verification email has been sent if the account still needs verification.', 'success');
    } catch (err) {
      showFeedback(form, err.message, 'error');
    } finally {
      lock(form, false);
    }
  }

  const handlers = {
    signup: handleSignup,
    login: handleLogin,
    forgot: handleForgot,
    reset: handleReset,
    'verify-code': handleVerifyCode,
    'resend-verification': handleResendVerification
  };

  document.addEventListener('DOMContentLoaded', () => {
    const resetForm = document.querySelector('form[data-auth-form="reset"]');
    if (resetForm) {
      const emailInput = resetForm.querySelector('[name="email"]');
      const codeInput = resetForm.querySelector('[name="code"]');
      const hintBox = document.querySelector('[data-reset-hint]');
      const emailFromQuery = qs('email');
      const codeFromQuery = qs('code');
      const tokenFromQuery = qs('token');
      if (emailInput && emailFromQuery) emailInput.value = emailFromQuery;
      if (codeInput && codeFromQuery) codeInput.value = codeFromQuery;
      if (!tokenFromQuery && emailFromQuery && hintBox) {
        hintBox.textContent = 'Check your email for the 6-digit reset code, then enter it below to set a new password.';
        hintBox.className = 'form-feedback is-success';
        hintBox.hidden = false;
      }
      if (!tokenFromQuery && codeInput) codeInput.focus();
    }

    document.querySelectorAll('form[data-auth-form]').forEach((form) => {
      const kind = form.getAttribute('data-auth-form');
      const handler = handlers[kind];
      if (!handler) return;
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        handler(form);
      });
    });
  });
})();
