/* =========================================================
   auth.js — frontend authentication client + UI
   Talks to the backend at /api (same origin by default).
   Override with window.MINDMAP_API_BASE = 'https://api.example.com'
   ========================================================= */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const API_BASE = (window.MINDMAP_API_BASE || '').replace(/\/+$/, '');
  const state = { user: null, pendingEmail: null, resetToken: null };

  /* ---------- API helper ---------- */
  async function api(path, opts) {
    opts = opts || {};
    const res = await fetch(API_BASE + '/api' + path, {
      method: opts.method || 'GET',
      credentials: 'include',
      headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    let data = null;
    try { data = await res.json(); } catch (e) { /* non-JSON */ }
    if (!res.ok) {
      const err = new Error((data && data.error && data.error.message) || 'Request failed');
      err.code = data && data.error && data.error.code;
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }
  const isNetErr = (e) => (e instanceof TypeError) || /fetch/i.test(e.message || '');
  const friendly = (e) => isNetErr(e) ? 'Could not reach the server. Is the backend running?' : (e.message || 'Something went wrong.');

  /* ---------- small helpers ---------- */
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const initials = (name) => (name || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const toast = (m) => { if (window.MindMapApp && window.MindMapApp.flash) window.MindMapApp.flash(m); };
  const nav = (p) => { if (window.MindMapApp && window.MindMapApp.navigate) window.MindMapApp.navigate(p); else location.hash = p; };
  const showErr = (el, msg) => { el.textContent = msg; el.hidden = false; };
  const hide = (el) => { if (el) el.hidden = true; };

  /* ---------- nav rendering ---------- */
  function renderNav() {
    const navAuth = $('#navAuth'), mob = $('#mobileAuth');
    if (!navAuth) return;
    if (state.user) {
      const u = state.user;
      navAuth.innerHTML =
        '<div class="nav__user">' +
          '<a class="nav__user-chip" href="#account" data-nav="account">' +
            '<span class="nav__avatar">' + initials(u.name) + '</span>' +
            '<span class="nav__user-name">' + escapeHtml(u.name.split(' ')[0]) + '</span>' +
          '</a>' +
          '<button class="nav__logout" id="navLogout">Log out</button>' +
        '</div>';
      if (mob) mob.innerHTML =
        '<a class="btn btn--ghost" href="#account" data-nav="account"><span>Account</span></a>' +
        '<button class="btn btn--gold" id="navLogoutM"><span>Log Out</span></button>';
    } else {
      navAuth.innerHTML =
        '<a class="nav__authlink" href="#login" data-nav="login">Log In</a>' +
        '<a class="btn btn--gold nav__signup" href="#signup" data-nav="signup"><span>Sign Up</span></a>';
      if (mob) mob.innerHTML =
        '<a class="btn btn--ghost" href="#login" data-nav="login"><span>Log In</span></a>' +
        '<a class="btn btn--gold" href="#signup" data-nav="signup"><span>Sign Up</span></a>';
    }
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('#navLogout') || e.target.closest('#navLogoutM')) { e.preventDefault(); doLogout(); }
  });

  async function refreshUser() {
    try { const d = await api('/auth/me'); state.user = d.user; }
    catch (e) { state.user = null; } // offline / no backend → treat as guest
    renderNav();
  }

  async function doLogout() {
    try { await api('/auth/logout', { method: 'POST' }); } catch (e) { /* ignore */ }
    state.user = null; renderNav();
    toast('Logged out.');
    nav('home');
  }

  /* ---------- verify page ---------- */
  function showVerifyPage(email, devUrl) {
    const em = $('#verifyEmail'); if (em) em.textContent = email || 'your email';
    const dev = $('#verifyDev');
    if (dev) {
      if (devUrl) { $('#verifyDevLink').href = devUrl; dev.hidden = false; }
      else dev.hidden = true;
    }
  }

  /* ---------- forms ---------- */
  function wireSignup() {
    const f = $('#signupForm'); if (!f) return;
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = $('#signupError'); hide(err);
      const name = $('#signupName').value.trim();
      const email = $('#signupEmail').value.trim();
      const password = $('#signupPassword').value;
      const confirmPassword = $('#signupConfirm').value;
      if (!name || !email) return showErr(err, 'Please fill in every field.');
      if (password.length < 8) return showErr(err, 'Password must be at least 8 characters.');
      if (password !== confirmPassword) return showErr(err, 'Passwords do not match.');
      const btn = f.querySelector('button[type=submit]'); btn.disabled = true;
      try {
        const d = await api('/auth/signup', { method: 'POST', body: { name, email, password, confirmPassword } });
        state.pendingEmail = d.email;
        showVerifyPage(d.email, d.devVerifyUrl);
        nav('verify');
      } catch (ex) { showErr(err, friendly(ex)); }
      finally { btn.disabled = false; }
    });
  }

  function wireLogin() {
    const f = $('#loginForm'); if (!f) return;
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = $('#loginError'); hide(err);
      const email = $('#loginEmail').value.trim();
      const password = $('#loginPassword').value;
      const btn = f.querySelector('button[type=submit]'); btn.disabled = true;
      try {
        const d = await api('/auth/login', { method: 'POST', body: { email, password } });
        state.user = d.user; renderNav();
        toast('Welcome back, ' + d.user.name.split(' ')[0] + '.');
        f.reset();
        nav('generator');
      } catch (ex) {
        if (ex.code === 'UNVERIFIED') {
          state.pendingEmail = (ex.data && ex.data.email) || email;
          showVerifyPage(state.pendingEmail);
          toast('Please verify your email first.');
          nav('verify');
        } else {
          showErr(err, friendly(ex));
        }
      } finally { btn.disabled = false; }
    });
  }

  function wireVerify() {
    const b = $('#resendBtn'); if (!b) return;
    b.addEventListener('click', async () => {
      const err = $('#verifyError'); hide(err);
      if (!state.pendingEmail) return showErr(err, 'No email on file to resend to. Please sign up or log in again.');
      b.disabled = true;
      try {
        const d = await api('/auth/resend', { method: 'POST', body: { email: state.pendingEmail } });
        showVerifyPage(state.pendingEmail, d.devVerifyUrl);
        toast('Verification email resent.');
      } catch (ex) { showErr(err, friendly(ex)); }
      finally { b.disabled = false; }
    });
  }

  function wireForgot() {
    const f = $('#forgotForm'); if (!f) return;
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = $('#forgotError'), ok = $('#forgotSuccess'); hide(err); hide(ok);
      const email = $('#forgotEmail').value.trim();
      const btn = f.querySelector('button[type=submit]'); btn.disabled = true;
      try {
        const d = await api('/auth/forgot-password', { method: 'POST', body: { email } });
        ok.textContent = 'If an account exists for that email, a reset link is on its way.'; ok.hidden = false;
        const dev = $('#forgotDev');
        if (d.devResetUrl) { $('#forgotDevLink').href = d.devResetUrl; dev.hidden = false; } else dev.hidden = true;
      } catch (ex) { showErr(err, friendly(ex)); }
      finally { btn.disabled = false; }
    });
  }

  function wireReset() {
    const f = $('#resetForm'); if (!f) return;
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = $('#resetError'), ok = $('#resetSuccess'); hide(err); hide(ok);
      const password = $('#resetPassword').value, confirmPassword = $('#resetConfirm').value;
      if (password.length < 8) return showErr(err, 'Password must be at least 8 characters.');
      if (password !== confirmPassword) return showErr(err, 'Passwords do not match.');
      if (!state.resetToken) return showErr(err, 'This reset link is invalid. Request a new one.');
      const btn = f.querySelector('button[type=submit]'); btn.disabled = true;
      try {
        await api('/auth/reset-password', { method: 'POST', body: { token: state.resetToken, password, confirmPassword } });
        ok.textContent = 'Password updated. Redirecting you to log in…'; ok.hidden = false;
        toast('Password updated.');
        setTimeout(() => nav('login'), 1300);
      } catch (ex) { showErr(err, friendly(ex)); }
      finally { btn.disabled = false; }
    });
  }

  /* ---------- account / my maps ---------- */
  async function renderAccount() {
    if (!state.user) { nav('login'); return; }
    $('#accountAvatar').textContent = initials(state.user.name);
    $('#accountName').textContent = state.user.name;
    $('#accountEmail').textContent = state.user.email;
    const badge = $('#accountBadge');
    if (state.user.verified) { badge.textContent = 'Verified'; badge.classList.remove('is-unverified'); }
    else { badge.textContent = 'Unverified'; badge.classList.add('is-unverified'); }
    await loadMyMaps();
  }

  async function loadMyMaps() {
    const list = $('#myMapsList'), empty = $('#myMapsEmpty'), count = $('#myMapsCount');
    if (!state.user || !state.user.verified) { list.innerHTML = ''; empty.hidden = false; count.textContent = ''; return; }
    try {
      const d = await api('/maps');
      const maps = d.maps || [];
      count.textContent = maps.length + (maps.length === 1 ? ' map' : ' maps');
      if (!maps.length) { list.innerHTML = ''; empty.hidden = false; return; }
      empty.hidden = true;
      list.innerHTML = maps.map(m => {
        const date = new Date(m.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        return '<article class="mapcard">' +
          '<h4 class="mapcard__title">' + escapeHtml(m.title) + '</h4>' +
          '<p class="mapcard__date">Updated ' + date + '</p>' +
          '<div class="mapcard__actions">' +
            '<button class="mapcard__btn" data-open="' + m.id + '">Open &rarr;</button>' +
            '<button class="mapcard__btn mapcard__del" data-del="' + m.id + '">Delete</button>' +
          '</div></article>';
      }).join('');
    } catch (ex) { count.textContent = ''; empty.hidden = false; }
  }

  document.addEventListener('click', async (e) => {
    const open = e.target.closest('[data-open]');
    const del = e.target.closest('.mapcard__del[data-del]');
    if (open) {
      try {
        const d = await api('/maps/' + open.dataset.open);
        if (window.MindMapApp && window.MindMapApp.loadMap) window.MindMapApp.loadMap(d.map.data, d.map.title);
      } catch (ex) { toast('Could not open that map.'); }
    } else if (del) {
      try { await api('/maps/' + del.dataset.del, { method: 'DELETE' }); toast('Map deleted.'); loadMyMaps(); }
      catch (ex) { toast('Could not delete that map.'); }
    }
  });

  /* ---------- public API used by main.js ---------- */
  window.MindMapAuth = {
    isAuthed: () => !!state.user,
    isVerified: () => !!(state.user && state.user.verified),
    user: () => state.user,
    onAccountShown: renderAccount,
    async saveMap(mapObj) {
      if (!state.user) { toast('Sign in to save maps to your account.'); nav('login'); return; }
      if (!state.user.verified) { toast('Verify your email to save maps to your account.'); nav('verify'); return; }
      try {
        const title = (mapObj && mapObj.root && mapObj.root.label) || 'Untitled map';
        await api('/maps', { method: 'POST', body: { title, data: mapObj } });
        toast('Saved to your account.');
      } catch (ex) { toast(friendly(ex)); }
    }
  };

  /* ---------- init ---------- */
  function handleUrlParams() {
    const params = new URLSearchParams(location.search);
    const verify = params.get('verify');
    const reset = params.get('reset');
    if (verify) {
      history.replaceState(null, '', location.pathname + location.hash);
      if (verify === 'success') { toast('Email verified — welcome!'); return { go: 'generator' }; }
      if (verify === 'expired') { toast('That verification link has expired. Request a new one.'); return { go: 'login' }; }
      toast('That verification link is invalid.'); return { go: 'login' };
    }
    if (reset) {
      state.resetToken = reset;
      history.replaceState(null, '', location.pathname + location.hash);
      return { go: 'reset' };
    }
    return null;
  }

  function init() {
    renderNav();
    wireSignup(); wireLogin(); wireVerify(); wireForgot(); wireReset();
    const action = handleUrlParams();
    refreshUser().then(() => { if (action) nav(action.go); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
