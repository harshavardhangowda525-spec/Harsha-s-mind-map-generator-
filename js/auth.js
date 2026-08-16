/* =========================================================
   auth.js — authentication + saved maps via Supabase.
   Runs entirely from the static frontend (no server to deploy).
   Configure your keys in js/config.js. Setup: SUPABASE_SETUP.md
   ========================================================= */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const cfg = window.MINDMAP_CONFIG || {};
  const configured = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);

  // Capture the URL hash before Supabase consumes it (email-confirm returns
  // #access_token=...&type=signup; recovery returns type=recovery).
  const initialHash = location.hash + location.search;
  const cameFromSignupLink = /type=signup/.test(initialHash);

  let sb = null;
  if (configured && window.supabase && window.supabase.createClient) {
    sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  }

  const state = { user: null, pendingEmail: null };

  /* ---------- helpers ---------- */
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const initials = (name) => (name || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const toast = (m) => { if (window.MindMapApp && window.MindMapApp.flash) window.MindMapApp.flash(m); };
  const nav = (p) => { if (window.MindMapApp && window.MindMapApp.navigate) window.MindMapApp.navigate(p); else location.hash = p; };
  const showErr = (el, msg) => { if (el) { el.textContent = msg; el.hidden = false; } };
  const hide = (el) => { if (el) el.hidden = true; };
  const appBaseUrl = () => location.origin + location.pathname; // must be whitelisted in Supabase

  const NOT_CONFIGURED = 'Accounts aren’t connected yet. Add your Supabase URL and anon key in js/config.js (see SUPABASE_SETUP.md).';
  const ensure = (el) => { if (!sb) { showErr(el, NOT_CONFIGURED); toast('Accounts not configured yet — see SUPABASE_SETUP.md'); return false; } return true; };

  function mapUser(u) {
    if (!u) return null;
    return {
      id: u.id,
      email: u.email,
      name: (u.user_metadata && (u.user_metadata.name || u.user_metadata.full_name)) || (u.email || '').split('@')[0],
      verified: !!u.email_confirmed_at
    };
  }

  // Friendlier text for common Supabase auth errors.
  function friendly(error) {
    const m = (error && error.message) || '';
    if (/already registered|already exists/i.test(m)) return 'An account with this email already exists.';
    if (/email not confirmed/i.test(m)) return 'Please verify your email first.';
    if (/invalid login credentials/i.test(m)) return 'Incorrect email or password.';
    if (/password should be at least/i.test(m)) return 'Password must be at least 8 characters.';
    if (/rate limit|too many/i.test(m)) return 'Too many attempts — please wait a moment and try again.';
    if (/redirect|not allowed/i.test(m)) return 'This site URL isn’t allowed in Supabase yet (add it under Authentication → URL Configuration).';
    return m || 'Something went wrong.';
  }

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
            '<span class="nav__user-name">' + escapeHtml((u.name || '').split(' ')[0]) + '</span>' +
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

  async function doLogout() {
    if (sb) { try { await sb.auth.signOut(); } catch (e) { /* ignore */ } }
    state.user = null; renderNav();
    toast('Logged out.');
    nav('home');
  }

  /* ---------- verify page ---------- */
  function showVerifyPage(email) {
    const em = $('#verifyEmail'); if (em) em.textContent = email || 'your email';
    hide($('#verifyDev')); // no dev link in the Supabase flow — real emails are sent
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
      if (!ensure(err)) return;
      const btn = f.querySelector('button[type=submit]'); btn.disabled = true;
      try {
        const { data, error } = await sb.auth.signUp({
          email, password,
          options: { data: { name }, emailRedirectTo: appBaseUrl() }
        });
        if (error) throw error;
        // With email confirmations on, an existing email returns a user with no identities.
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          return showErr(err, 'An account with this email already exists.');
        }
        state.pendingEmail = email;
        showVerifyPage(email);
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
      if (!ensure(err)) return;
      const btn = f.querySelector('button[type=submit]'); btn.disabled = true;
      try {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) {
          if (/email not confirmed/i.test(error.message)) {
            state.pendingEmail = email; showVerifyPage(email);
            toast('Please verify your email first.'); nav('verify'); return;
          }
          throw error;
        }
        state.user = mapUser(data.user); renderNav();
        toast('Welcome back, ' + (state.user.name || '').split(' ')[0] + '.');
        f.reset();
        nav('generator');
      } catch (ex) { showErr(err, friendly(ex)); }
      finally { btn.disabled = false; }
    });
  }

  function wireVerify() {
    const b = $('#resendBtn'); if (!b) return;
    b.addEventListener('click', async () => {
      const err = $('#verifyError'); hide(err);
      if (!ensure(err)) return;
      if (!state.pendingEmail) return showErr(err, 'No email on file. Please sign up or log in again.');
      b.disabled = true;
      try {
        const { error } = await sb.auth.resend({ type: 'signup', email: state.pendingEmail, options: { emailRedirectTo: appBaseUrl() } });
        if (error) throw error;
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
      if (!ensure(err)) return;
      const btn = f.querySelector('button[type=submit]'); btn.disabled = true;
      try {
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: appBaseUrl() });
        if (error) throw error;
        ok.textContent = 'If an account exists for that email, a reset link is on its way.'; ok.hidden = false;
        hide($('#forgotDev'));
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
      if (!ensure(err)) return;
      const btn = f.querySelector('button[type=submit]'); btn.disabled = true;
      try {
        const { error } = await sb.auth.updateUser({ password });
        if (error) throw error;
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
    if (!sb || !state.user) { list.innerHTML = ''; empty.hidden = false; count.textContent = ''; return; }
    try {
      const { data, error } = await sb.from('maps').select('id,title,updated_at').order('updated_at', { ascending: false });
      if (error) throw error;
      const maps = data || [];
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
    if (open && sb) {
      try {
        const { data, error } = await sb.from('maps').select('title,data').eq('id', open.dataset.open).single();
        if (error) throw error;
        if (window.MindMapApp && window.MindMapApp.loadMap) window.MindMapApp.loadMap(data.data, data.title);
      } catch (ex) { toast('Could not open that map.'); }
    } else if (del && sb) {
      try {
        const { error } = await sb.from('maps').delete().eq('id', del.dataset.del);
        if (error) throw error;
        toast('Map deleted.'); loadMyMaps();
      } catch (ex) { toast('Could not delete that map.'); }
    }
  });

  /* ---------- public API used by main.js ---------- */
  window.MindMapAuth = {
    isAuthed: () => !!state.user,
    isVerified: () => !!(state.user && state.user.verified),
    user: () => state.user,
    onAccountShown: renderAccount,
    async saveMap(mapObj) {
      if (!sb) { toast(NOT_CONFIGURED); return; }
      if (!state.user) { toast('Sign in to save maps to your account.'); nav('login'); return; }
      try {
        const title = (mapObj && mapObj.root && mapObj.root.label) || 'Untitled map';
        const { error } = await sb.from('maps').insert({ title, data: mapObj });
        if (error) throw error;
        toast('Saved to your account.');
      } catch (ex) { toast('Could not save: ' + friendly(ex)); }
    }
  };

  /* ---------- init ---------- */
  function init() {
    renderNav();
    wireSignup(); wireLogin(); wireVerify(); wireForgot(); wireReset();

    if (!sb) {
      // Not configured yet — the site still works as a guest; account
      // actions show a helpful message pointing at SUPABASE_SETUP.md.
      return;
    }

    // Reflect the current session, then keep it in sync.
    sb.auth.getSession().then(({ data }) => {
      state.user = mapUser(data.session && data.session.user);
      renderNav();
    });

    sb.auth.onAuthStateChange((event, session) => {
      state.user = mapUser(session && session.user);
      renderNav();
      if (event === 'PASSWORD_RECOVERY') { nav('reset'); return; }
      if (event === 'SIGNED_OUT') { return; }
      if (event === 'SIGNED_IN' && cameFromSignupLink) {
        toast('Email verified — welcome!');
        nav('generator');
      }
      // Refresh the maps list if the account page is currently open.
      const acct = $('#account');
      if (state.user && acct && getComputedStyle(acct).display !== 'none') renderAccount();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
