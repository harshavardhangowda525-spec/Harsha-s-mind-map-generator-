/* =========================================================
   auth.js — authentication gate, session, profile & admin UI.
   Talks to the backend at /api (same origin).
   ========================================================= */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const API = (window.MINDMAP_API_BASE || '').replace(/\/+$/, '');
  const App = () => window.MindMapApp || {};
  const state = { user: null, pendingEmail: null, resetToken: null, devVerifyUrl: null, loading: true };

  /* ---------- API ---------- */
  async function api(path, opts) {
    opts = opts || {};
    let res;
    try {
      res = await fetch(API + '/api' + path, {
        method: opts.method || 'GET',
        credentials: 'include',
        headers: opts.body ? { 'Content-Type': 'application/json' } : undefined,
        body: opts.body ? JSON.stringify(opts.body) : undefined
      });
    } catch (e) { const err = new Error('network'); err.code = 'NETWORK'; throw err; }
    let data = null; try { data = await res.json(); } catch (e) { /* non-JSON */ }
    if (!res.ok) {
      const code = (data && data.error && data.error.code) || (data ? 'HTTP_' + res.status : 'NO_BACKEND');
      // If an active session was disabled mid-use, show the disabled screen.
      if (code === 'DISABLED' && state.user) showDisabled();
      const err = new Error((data && data.error && data.error.message) || 'Request failed');
      err.code = code; err.status = res.status; err.data = data; throw err;
    }
    return data;
  }
  const friendly = (e) =>
    e.code === 'NETWORK' ? 'Could not reach the server. Please try again.'
      : e.code === 'NO_BACKEND' ? 'The server isn’t reachable. Make sure the backend is running.'
        : (e.message || 'Something went wrong.');

  /* ---------- small helpers ---------- */
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const initials = (name) => (name || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const toast = (m) => { if (App().flash) App().flash(m); };
  const nav = (p) => { if (App().navigate) App().navigate(p); else location.hash = p; };
  const fmtDate = (t) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const showMsg = (el, msg) => { if (el) { el.textContent = msg; el.hidden = false; } };
  const hide = (el) => { if (el) el.hidden = true; };
  function setLoading(btn, on) { if (!btn) return; btn.classList.toggle('is-loading', on); btn.disabled = on; }
  function setAuthedBody() { document.body.classList.toggle('is-authed', !!state.user); }

  /* ---------- password visibility toggles (delegated) ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('.pw-toggle'); if (!t) return;
    const inp = document.getElementById(t.dataset.toggle); if (!inp) return;
    const reveal = inp.type === 'password';
    inp.type = reveal ? 'text' : 'password';
    t.textContent = reveal ? 'Hide' : 'Show';
  });

  /* ---------- router hooks used by main.js ---------- */
  const AUTH_PAGES = ['login', 'signup', 'verify', 'forgot', 'reset'];
  function gate(name) {
    if (name === 'reset') return 'reset';               // reachable via email link even if logged in
    const u = state.user;
    if (u) {
      if (AUTH_PAGES.includes(name)) return 'generator';
      if (name === 'admin' && u.role !== 'admin') return 'generator';
      return name;
    }
    if (AUTH_PAGES.includes(name)) return name;
    return 'login';                                      // everything else is protected
  }
  function onPageShown(name) {
    if (name === 'profile') renderProfile();
    else if (name === 'settings') renderSettings();
    else if (name === 'admin') loadAdmin('');
    else if (name === 'verify') showVerify(state.pendingEmail, state.devVerifyUrl);
  }

  /* ---------- nav profile menu ---------- */
  function renderNav() {
    const el = $('#navUser'), mob = $('#mobileAuth');
    if (!el) return;
    if (state.user) {
      const u = state.user;
      el.innerHTML =
        '<div class="nav__profile" id="navProfile">' +
          '<button class="nav__profile-btn" id="navProfileBtn">' +
            '<span class="nav__avatar">' + initials(u.name) + '</span>' +
            '<span class="nav__profile-name">' + escapeHtml((u.name || '').split(' ')[0]) + '</span>' +
            '<svg class="nav__caret" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>' +
          '</button>' +
          '<div class="nav__menu">' +
            '<div class="nav__menu-head"><b>' + escapeHtml(u.name) + '</b><span>' + escapeHtml(u.email) + '</span></div>' +
            '<a href="#profile" data-nav="profile">Profile</a>' +
            '<a href="#settings" data-nav="settings">Account Settings</a>' +
            (u.role === 'admin' ? '<a class="is-admin" href="#admin" data-nav="admin">Admin Panel</a>' : '') +
            '<button class="is-danger" id="menuLogout">Log Out</button>' +
          '</div>' +
        '</div>';
      if (mob) mob.innerHTML =
        '<a class="btn btn--ghost" href="#profile" data-nav="profile"><span>Profile</span></a>' +
        (u.role === 'admin' ? '<a class="btn btn--ghost" href="#admin" data-nav="admin"><span>Admin</span></a>' : '') +
        '<button class="btn btn--gold" id="menuLogoutM"><span>Log Out</span></button>';
    } else { el.innerHTML = ''; if (mob) mob.innerHTML = ''; }
  }

  document.addEventListener('click', (e) => {
    const prof = $('#navProfile');
    if (e.target.closest('#navProfileBtn')) { e.preventDefault(); if (prof) prof.classList.toggle('is-open'); return; }
    if (prof && (!e.target.closest('.nav__menu') || e.target.closest('.nav__menu a, .nav__menu button'))) prof.classList.remove('is-open');
    if (e.target.closest('#menuLogout') || e.target.closest('#menuLogoutM')) { e.preventDefault(); doLogout(); }
  });

  async function refreshUser() {
    try { const d = await api('/auth/me'); state.user = d.user || null; if (d.disabled) showDisabled(); }
    catch (e) { state.user = null; }
    state.loading = false; setAuthedBody(); renderNav();
    return state.user;
  }

  async function doLogout() {
    try { await api('/auth/logout', { method: 'POST' }); } catch (e) { /* ignore */ }
    state.user = null; setAuthedBody(); renderNav();
    toast('Logged out.'); nav('login');
  }

  /* ---------- disabled screen ---------- */
  function showDisabled() {
    state.user = null; setAuthedBody(); renderNav();
    const s = $('#disabledScreen'); if (s) s.hidden = false;
  }
  (function () {
    const b = $('#disabledLogout');
    if (b) b.addEventListener('click', () => { $('#disabledScreen').hidden = true; nav('login'); });
  })();

  /* ---------- verify page ---------- */
  function showVerify(email, devUrl) {
    const em = $('#verifyEmail'); if (em) em.textContent = email || 'your email';
    const dev = $('#verifyDev');
    if (dev) { if (devUrl) { $('#verifyDevLink').href = devUrl; dev.hidden = false; } else dev.hidden = true; }
  }

  /* ---------- forms ---------- */
  function wireForms() {
    // Sign up
    on('#signupForm', 'submit', async (e, f) => {
      const err = $('#signupError'); hide(err);
      const name = $('#signupName').value.trim();
      const email = $('#signupEmail').value.trim();
      const password = $('#signupPassword').value;
      const confirmPassword = $('#signupConfirm').value;
      if (!name || !email) return showMsg(err, 'Please fill in every field.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showMsg(err, 'Please enter a valid email address.');
      if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password))
        return showMsg(err, 'Password must be at least 8 characters with a letter and a number.');
      if (password !== confirmPassword) return showMsg(err, 'Passwords do not match.');
      const btn = f.querySelector('button[type=submit]'); setLoading(btn, true);
      try {
        const d = await api('/auth/signup', { method: 'POST', body: { name, email, password, confirmPassword } });
        state.pendingEmail = d.email; state.devVerifyUrl = d.devVerifyUrl || null;
        showVerify(d.email, state.devVerifyUrl); nav('verify');
      } catch (ex) { showMsg(err, friendly(ex)); } finally { setLoading(btn, false); }
    });

    // Log in
    on('#loginForm', 'submit', async (e, f) => {
      const err = $('#loginError'); hide(err);
      const email = $('#loginEmail').value.trim();
      const password = $('#loginPassword').value;
      const btn = f.querySelector('button[type=submit]'); setLoading(btn, true);
      try {
        const d = await api('/auth/login', { method: 'POST', body: { email, password } });
        state.user = d.user; setAuthedBody(); renderNav(); f.reset();
        toast('Welcome back, ' + (d.user.name || '').split(' ')[0] + '.');
        nav('generator');
      } catch (ex) {
        if (ex.code === 'UNVERIFIED') {
          state.pendingEmail = (ex.data && ex.data.email) || email;
          showVerify(state.pendingEmail); toast('Please verify your email first.'); nav('verify');
        } else showMsg(err, friendly(ex));
      } finally { setLoading(btn, false); }
    });

    // Resend verification
    on('#resendBtn', 'click', async (e, b) => {
      const err = $('#verifyError'), ok = $('#verifyOk'); hide(err); hide(ok);
      if (!state.pendingEmail) return showMsg(err, 'No email on file. Please sign up or log in again.');
      setLoading(b, true);
      try {
        const d = await api('/auth/resend', { method: 'POST', body: { email: state.pendingEmail } });
        state.devVerifyUrl = d.devVerifyUrl || null; showVerify(state.pendingEmail, state.devVerifyUrl);
        showMsg(ok, 'Verification email resent. Please check your inbox.');
      } catch (ex) { showMsg(err, friendly(ex)); } finally { setLoading(b, false); }
    });

    // Change email (toggle + submit)
    on('#changeEmailBtn', 'click', () => { const f = $('#changeEmailForm'); f.hidden = !f.hidden; });
    on('#changeEmailForm', 'submit', async (e, f) => {
      const err = $('#changeEmailError'); hide(err);
      const newEmail = $('#changeEmailNew').value.trim();
      const password = $('#changeEmailPw').value;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) return showMsg(err, 'Please enter a valid new email address.');
      const btn = f.querySelector('button[type=submit]'); setLoading(btn, true);
      try {
        const d = await api('/auth/change-email', { method: 'POST', body: { email: state.pendingEmail, newEmail, password } });
        state.pendingEmail = d.email; state.devVerifyUrl = d.devVerifyUrl || null;
        f.hidden = true; f.reset();
        showVerify(d.email, state.devVerifyUrl);
        toast('Email updated — a new verification link was sent.');
      } catch (ex) { showMsg(err, friendly(ex)); } finally { setLoading(btn, false); }
    });

    // Forgot password
    on('#forgotForm', 'submit', async (e, f) => {
      const err = $('#forgotError'), ok = $('#forgotSuccess'); hide(err); hide(ok);
      const email = $('#forgotEmail').value.trim();
      const btn = f.querySelector('button[type=submit]'); setLoading(btn, true);
      try {
        const d = await api('/auth/forgot-password', { method: 'POST', body: { email } });
        showMsg(ok, 'If an account exists for that email, a reset link is on its way.');
        const dev = $('#forgotDev');
        if (d.devResetUrl) { $('#forgotDevLink').href = d.devResetUrl; dev.hidden = false; } else dev.hidden = true;
      } catch (ex) { showMsg(err, friendly(ex)); } finally { setLoading(btn, false); }
    });

    // Reset password
    on('#resetForm', 'submit', async (e, f) => {
      const err = $('#resetError'), ok = $('#resetSuccess'); hide(err); hide(ok);
      const password = $('#resetPassword').value, confirmPassword = $('#resetConfirm').value;
      if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password))
        return showMsg(err, 'Password must be at least 8 characters with a letter and a number.');
      if (password !== confirmPassword) return showMsg(err, 'Passwords do not match.');
      if (!state.resetToken) return showMsg(err, 'This reset link is invalid. Request a new one.');
      const btn = f.querySelector('button[type=submit]'); setLoading(btn, true);
      try {
        await api('/auth/reset-password', { method: 'POST', body: { token: state.resetToken, password, confirmPassword } });
        showMsg(ok, 'Password updated. Redirecting you to log in…');
        toast('Password updated.'); setTimeout(() => nav('login'), 1300);
      } catch (ex) { showMsg(err, friendly(ex)); } finally { setLoading(btn, false); }
    });

    // Settings — profile
    on('#profileForm', 'submit', async (e, f) => {
      const err = $('#profileError'), ok = $('#profileSuccess'); hide(err); hide(ok);
      const name = $('#profileNameInput').value.trim();
      if (!name) return showMsg(err, 'Name is required.');
      const btn = f.querySelector('button[type=submit]'); setLoading(btn, true);
      try {
        const d = await api('/auth/profile', { method: 'PUT', body: { name } });
        state.user = d.user; renderNav(); showMsg(ok, 'Profile updated.');
      } catch (ex) { showMsg(err, friendly(ex)); } finally { setLoading(btn, false); }
    });

    // Settings — password
    on('#passwordForm', 'submit', async (e, f) => {
      const err = $('#passwordError'), ok = $('#passwordSuccess'); hide(err); hide(ok);
      const currentPassword = $('#curPassword').value;
      const newPassword = $('#newPassword').value, confirmPassword = $('#newPasswordConfirm').value;
      if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword))
        return showMsg(err, 'New password must be at least 8 characters with a letter and a number.');
      if (newPassword !== confirmPassword) return showMsg(err, 'Passwords do not match.');
      const btn = f.querySelector('button[type=submit]'); setLoading(btn, true);
      try {
        await api('/auth/profile/password', { method: 'POST', body: { currentPassword, newPassword, confirmPassword } });
        f.reset(); showMsg(ok, 'Password updated.');
      } catch (ex) { showMsg(err, friendly(ex)); } finally { setLoading(btn, false); }
    });
  }
  function on(sel, ev, fn) {
    const el = $(sel); if (!el) return;
    el.addEventListener(ev, (e) => { if (ev === 'submit') e.preventDefault(); fn(e, el); });
  }

  /* ---------- profile / my maps ---------- */
  function renderProfile() {
    if (!state.user) { nav('login'); return; }
    const u = state.user;
    $('#profileAvatar').textContent = initials(u.name);
    $('#profileName').textContent = u.name;
    $('#profileEmail').textContent = u.email;
    const badge = $('#profileBadge');
    if (u.verified) { badge.textContent = 'Verified'; badge.classList.remove('is-unverified'); }
    else { badge.textContent = 'Unverified'; badge.classList.add('is-unverified'); }
    $('#profileRole').hidden = u.role !== 'admin';
    loadMyMaps();
  }
  function renderSettings() {
    if (!state.user) { nav('login'); return; }
    $('#profileNameInput').value = state.user.name;
    $('#profileEmailInput').value = state.user.email;
    ['profileError', 'profileSuccess', 'passwordError', 'passwordSuccess'].forEach(id => hide($('#' + id)));
  }
  async function loadMyMaps() {
    const list = $('#myMapsList'), empty = $('#myMapsEmpty'), count = $('#myMapsCount');
    try {
      const d = await api('/maps');
      const maps = d.maps || [];
      count.textContent = maps.length + (maps.length === 1 ? ' map' : ' maps');
      if (!maps.length) { list.innerHTML = ''; empty.hidden = false; return; }
      empty.hidden = true;
      list.innerHTML = maps.map(m =>
        '<article class="mapcard"><h4 class="mapcard__title">' + escapeHtml(m.title) + '</h4>' +
        '<p class="mapcard__date">Updated ' + fmtDate(m.updated_at) + '</p>' +
        '<div class="mapcard__actions"><button class="mapcard__btn" data-open="' + m.id + '">Open &rarr;</button>' +
        '<button class="mapcard__btn mapcard__del" data-del="' + m.id + '">Delete</button></div></article>'
      ).join('');
    } catch (ex) { count.textContent = ''; empty.hidden = false; }
  }
  document.addEventListener('click', async (e) => {
    const open = e.target.closest('.mapcard [data-open]');
    const del = e.target.closest('.mapcard__del[data-del]');
    if (open) {
      try { const d = await api('/maps/' + open.dataset.open); if (App().loadMap) App().loadMap(d.map.data, d.map.title); }
      catch (ex) { toast('Could not open that map.'); }
    } else if (del) {
      if (!confirm('Delete this saved map?')) return;
      try { await api('/maps/' + del.dataset.del, { method: 'DELETE' }); toast('Map deleted.'); loadMyMaps(); }
      catch (ex) { toast('Could not delete that map.'); }
    }
  });

  /* ---------- admin panel ---------- */
  async function loadAdmin(q) {
    if (!state.user || state.user.role !== 'admin') return;
    try {
      const s = await api('/admin/stats');
      $('#adminStats').innerHTML = [['Users', s.stats.users], ['Verified', s.stats.verified], ['Disabled', s.stats.disabled], ['Saved maps', s.stats.maps]]
        .map(([k, v]) => '<div class="admin__stat"><b>' + v + '</b><span>' + k + '</span></div>').join('');
    } catch (e) { /* ignore */ }
    try {
      const d = await api('/admin/users' + (q ? ('?q=' + encodeURIComponent(q)) : ''));
      renderAdminRows(d.users || []);
    } catch (e) { $('#adminRows').innerHTML = '<tr><td colspan="7">Could not load users.</td></tr>'; }
  }
  function renderAdminRows(users) {
    const tb = $('#adminRows');
    if (!users.length) { tb.innerHTML = '<tr><td colspan="7">No users found.</td></tr>'; return; }
    tb.innerHTML = users.map(u => {
      const status = u.status === 'active' ? '<span class="pill pill--active">Active</span>' : '<span class="pill pill--disabled">Disabled</span>';
      const verified = u.verified ? '<span class="pill pill--yes">Yes</span>' : '<span class="pill pill--no">No</span>';
      const role = u.role === 'admin' ? '<span class="pill pill--admin">Admin</span>' : '<span class="pill">User</span>';
      let actions = '<button class="admin__act" data-view="' + u.id + '">View</button>';
      if (u.role !== 'admin') {
        actions += (u.status === 'active'
          ? '<button class="admin__act is-danger" data-disable="' + u.id + '">Disable</button>'
          : '<button class="admin__act" data-enable="' + u.id + '">Enable</button>');
        actions += '<button class="admin__act is-danger" data-adel="' + u.id + '">Delete</button>';
      }
      return '<tr><td>' + escapeHtml(u.name) + '</td><td>' + escapeHtml(u.email) + '</td><td>' + status + '</td><td>' +
        verified + '</td><td>' + role + '</td><td>' + fmtDate(u.createdAt) + '</td>' +
        '<td><div class="admin__actions">' + actions + '</div></td></tr>';
    }).join('');
  }
  (function wireAdmin() {
    const search = $('#adminSearch');
    if (search) { let t; search.addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => loadAdmin(e.target.value.trim()), 300); }); }
    const rows = $('#adminRows');
    if (rows) rows.addEventListener('click', async (e) => {
      const view = e.target.closest('[data-view]'), dis = e.target.closest('[data-disable]'),
        en = e.target.closest('[data-enable]'), del = e.target.closest('[data-adel]');
      if (view) return openAdminUser(view.dataset.view);
      if (dis) { if (!confirm('Disable this account? The user will be signed out and blocked from logging in.')) return; await adminAct('/admin/users/' + dis.dataset.disable + '/disable', 'POST'); }
      else if (en) { await adminAct('/admin/users/' + en.dataset.enable + '/enable', 'POST'); }
      else if (del) { if (!confirm('Permanently delete this account and all its data? This cannot be undone.')) return; await adminAct('/admin/users/' + del.dataset.adel, 'DELETE'); }
    });
    const close = $('#adminDrawerClose');
    if (close) close.addEventListener('click', () => $('#adminDrawer').classList.remove('is-open'));
  })();
  async function adminAct(path, method) {
    try { await api(path, { method }); toast('Done.'); loadAdmin($('#adminSearch').value.trim()); }
    catch (ex) { toast(friendly(ex)); }
  }
  async function openAdminUser(id) {
    try {
      const d = await api('/admin/users/' + id); const u = d.user;
      $('#adminUserName').textContent = u.name;
      $('#adminUserMeta').innerHTML =
        'Email: ' + escapeHtml(u.email) + '<br>Status: ' + u.status + '<br>Verified: ' + (u.verified ? 'Yes' : 'No') +
        '<br>Role: ' + u.role + '<br>Joined: ' + new Date(u.createdAt).toLocaleString() + '<br>Saved maps: ' + u.mapCount;
      const m = await api('/admin/users/' + id + '/maps');
      $('#adminUserMaps').innerHTML = (m.maps && m.maps.length)
        ? m.maps.map(x => '<span>' + escapeHtml(x.title) + '</span>').join('')
        : '<span>No saved maps</span>';
      $('#adminDrawer').classList.add('is-open');
    } catch (ex) { toast(friendly(ex)); }
  }

  /* ---------- public API for main.js ---------- */
  window.MindMapAuth = {
    gate, onPageShown,
    isAuthed: () => !!state.user,
    isVerified: () => !!(state.user && state.user.verified),
    async saveMap(mapObj) {
      if (!state.user) { toast('Please log in to save maps.'); nav('login'); return; }
      try {
        const title = (mapObj && mapObj.root && mapObj.root.label) || 'Untitled map';
        await api('/maps', { method: 'POST', body: { title, data: mapObj } });
        toast('Saved to your account.');
      } catch (ex) { toast('Could not save: ' + friendly(ex)); }
    }
  };

  /* ---------- init ---------- */
  function init() {
    renderNav(); wireForms();
    const params = new URLSearchParams(location.search);
    const verify = params.get('verify'), reset = params.get('reset');
    let forced = null;
    if (verify) {
      history.replaceState(null, '', location.pathname + location.hash);
      if (verify === 'success') { toast('Email verified — welcome!'); forced = 'generator'; }
      else if (verify === 'expired') { toast('That verification link has expired. Request a new one.'); forced = 'login'; }
      else { toast('That verification link is invalid.'); forced = 'login'; }
    } else if (reset) {
      state.resetToken = reset;
      history.replaceState(null, '', location.pathname + location.hash);
      forced = 'reset';
    }
    refreshUser().then(() => {
      if (forced) nav(forced);
      else if (App().applyInitialRoute) App().applyInitialRoute();
      else nav(state.user ? 'generator' : 'login');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
