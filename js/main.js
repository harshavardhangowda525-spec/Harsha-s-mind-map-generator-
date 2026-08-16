/* =========================================================
   main.js — orchestration, animations, canvases, wiring
   ========================================================= */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Loader
  --------------------------------------------------------- */
  const loader = $('#loader'), loaderBar = $('#loaderBar');
  let lp = 0;
  const li = setInterval(() => {
    lp = Math.min(100, lp + Math.random() * 22);
    if (loaderBar) loaderBar.style.width = lp + '%';
    if (lp >= 100) {
      clearInterval(li);
      setTimeout(() => {
        loader.classList.add('is-done');
        document.body.classList.add('is-ready');
        startHero();
      }, 350);
    }
  }, 130);
  window.addEventListener('load', () => { lp = Math.max(lp, 80); });

  /* ---------------------------------------------------------
     Custom cursor + magnetic buttons
  --------------------------------------------------------- */
  const cursor = $('#cursor'), cursorDot = $('#cursorDot');
  if (cursor && !reduce && window.matchMedia('(pointer:fine)').matches) {
    let cx = 0, cy = 0, dx = 0, dy = 0;
    window.addEventListener('pointermove', (e) => {
      dx = e.clientX; dy = e.clientY;
      cursorDot.style.transform = `translate(${dx}px,${dy}px) translate(-50%,-50%)`;
    });
    (function loop() {
      cx += (dx - cx) * 0.18; cy += (dy - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    const hoverables = 'a, button, [data-magnetic], .chip, .tool, .node-group, textarea, input';
    document.addEventListener('pointerover', (e) => {
      if (e.target.closest(hoverables)) cursor.classList.add('is-hover');
    });
    document.addEventListener('pointerout', (e) => {
      if (e.target.closest(hoverables)) cursor.classList.remove('is-hover');
    });
  }

  // Magnetic effect
  if (!reduce) {
    $$('[data-magnetic]').forEach(elm => {
      elm.addEventListener('pointermove', (e) => {
        const r = elm.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        elm.style.transform = `translate(${mx * 0.25}px, ${my * 0.35}px)`;
      });
      elm.addEventListener('pointerleave', () => { elm.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------
     Nav / scroll progress
  --------------------------------------------------------- */
  const nav = $('#nav'), scrollBar = $('#scrollBar');
  const burger = $('#burger'), mobileMenu = $('#mobileMenu');
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 60);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollBar) scrollBar.style.width = (y / h * 100) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    mobileMenu.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('.mobile-menu__link').forEach(l => l.addEventListener('click', () => {
    nav.classList.remove('is-open'); mobileMenu.classList.remove('is-open'); document.body.style.overflow = '';
  }));

  /* ---------------------------------------------------------
     Reveal on scroll
  --------------------------------------------------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal, .hero, [data-feature]').forEach(e => io.observe(e));

  // Split reveal-lines titles into words for staggered fade
  $$('.reveal-lines').forEach(title => {
    const html = title.innerHTML;
    if (html.indexOf('<br') !== -1) {
      title.innerHTML = html.split(/<br\s*\/?>/i).map(seg =>
        '<span class="rl-row">' + seg.trim() + '</span>').join('<br>');
    }
    io.observe(title);
    title.classList.add('reveal');
  });

  /* ---------------------------------------------------------
     Page router — each nav item opens as its own page
  --------------------------------------------------------- */
  const PAGES = ['home', 'generator', 'storybook', 'journey', 'features', 'about'];
  const navLinks = $$('[data-nav]');
  let currentPage = null;

  function onPageShown(name) {
    onScroll();
    if (name === 'generator' && currentMap) requestAnimationFrame(() => map.fit());
    if (name === 'storybook' && storyRoot) requestAnimationFrame(() => storyMap.fit());
  }

  function showPage(name) {
    if (!PAGES.includes(name)) name = 'home';
    document.querySelectorAll('#app > [data-page]').forEach(el => {
      el.style.display = (el.getAttribute('data-page') === name) ? '' : 'none';
    });
    navLinks.forEach(a => a.classList.toggle('is-active', a.dataset.nav === name));
    currentPage = name;
    window.scrollTo(0, 0);
    onPageShown(name);
  }

  function navigate(name) {
    if ((location.hash.slice(1) || 'home') === name) showPage(name);
    else location.hash = name;            // triggers hashchange -> showPage
  }

  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) {
      e.preventDefault();
      navigate(nav.dataset.nav);
      nav.classList.remove('is-open');
      document.getElementById('nav').classList.remove('is-open');
      document.getElementById('mobileMenu').classList.remove('is-open');
      document.body.style.overflow = '';
      return;
    }
    const scr = e.target.closest('[data-scroll]');
    if (scr) {
      e.preventDefault();
      const t = document.getElementById(scr.dataset.scroll);
      if (t) t.scrollIntoView({ behavior: 'smooth' });
    }
  });

  window.addEventListener('hashchange', () => {
    const name = location.hash.slice(1);
    if (PAGES.includes(name)) showPage(name);
  });

  /* ---------------------------------------------------------
     Count-up stats
  --------------------------------------------------------- */
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const b = en.target;
      const target = +b.dataset.target;
      let cur = 0;
      const step = target / 60;
      const t = setInterval(() => {
        cur = Math.min(target, cur + step);
        b.textContent = Math.round(cur);
        if (cur >= target) clearInterval(t);
      }, 20);
      statObserver.unobserve(b);
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach(b => statObserver.observe(b));

  /* ---------------------------------------------------------
     Hero neural canvas
  --------------------------------------------------------- */
  function neuralField(canvas, opts) {
    opts = opts || {};
    const ctx = canvas.getContext('2d');
    let W, H, nodes = [], raf, mouse = { x: -999, y: -999 };
    const DENSITY = opts.density || 0.00009;
    const LINK = opts.link || 150;
    function resize() {
      const r = canvas.getBoundingClientRect();
      W = canvas.width = r.width * devicePixelRatio;
      H = canvas.height = r.height * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      const count = Math.min(140, Math.max(28, Math.floor(r.width * r.height * DENSITY)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * r.width, y: Math.random() * r.height,
        vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.8 + 0.6
      }));
      canvas._w = r.width; canvas._h = r.height;
    }
    function frame() {
      const w = canvas._w, h = canvas._h;
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        const mdx = n.x - mouse.x, mdy = n.y - mouse.y;
        const md = Math.hypot(mdx, mdy);
        if (md < 120) { n.x += mdx / md * 0.6; n.y += mdy / md * 0.6; }
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            const o = (1 - d / LINK) * 0.5;
            ctx.strokeStyle = `rgba(201,162,75,${o * 0.55})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(244,241,234,.55)';
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    canvas.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    window.addEventListener('resize', resize);
    resize();
    if (!reduce) frame(); else { /* static draw once */ frame(); cancelAnimationFrame(raf); }
    return { stop: () => cancelAnimationFrame(raf) };
  }

  const heroCanvas = $('#neuralCanvas');
  if (heroCanvas) neuralField(heroCanvas, { density: 0.00011, link: 155 });
  const parallaxCanvas = $('#parallaxCanvas');
  if (parallaxCanvas) neuralField(parallaxCanvas, { density: 0.00007, link: 170 });
  const finalCanvas = $('#finalCanvas');
  if (finalCanvas) neuralField(finalCanvas, { density: 0.00008, link: 160 });

  function startHero() {
    const hero = $('#hero');
    if (hero) hero.classList.add('is-in');
  }

  /* ---------------------------------------------------------
     Hero parallax on scroll
  --------------------------------------------------------- */
  if (!reduce) {
    const heroContent = $('.hero__content');
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight && heroContent) {
        heroContent.style.transform = `translateY(${y * 0.28}px)`;
        heroContent.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.75)));
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     Parallax statement — concept nodes appear on scroll
  --------------------------------------------------------- */
  // handled by neuralField already; add subtle vertical drift
  if (!reduce) {
    const pxSection = $('#parallax');
    const pxInner = $('.parallax__inner');
    window.addEventListener('scroll', () => {
      if (!pxSection) return;
      const r = pxSection.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        const prog = (window.innerHeight - r.top) / (window.innerHeight + r.height);
        if (pxInner) pxInner.style.transform = `translateY(${(prog - 0.5) * 80}px)`;
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     About — text fill on scroll
  --------------------------------------------------------- */
  const aboutText = $('#aboutText');
  if (aboutText) {
    const raw = aboutText.textContent.trim();
    aboutText.innerHTML = raw.split(' ').map(word =>
      '<span class="fill-word">' + word.split('').map(c => `<span class="fill-char">${c}</span>`).join('') + '</span>'
    ).join(' <span class="fill-char"> </span> ');
    const chars = $$('.fill-char', aboutText);
    window.addEventListener('scroll', () => {
      const r = aboutText.getBoundingClientRect();
      const start = window.innerHeight * 0.85, end = window.innerHeight * 0.25;
      const prog = Math.min(1, Math.max(0, (start - r.top) / (start - end)));
      const lit = Math.floor(prog * chars.length);
      chars.forEach((c, i) => c.classList.toggle('is-lit', i <= lit));
    }, { passive: true });
  }

  /* =========================================================
     GENERATOR wiring
     ========================================================= */
  const svgEl = $('#mapSvg');
  const zoomLevel = $('#zoomLevel');
  const map = new MindMap(svgEl, {
    layout: 'radial', animate: !reduce,
    onSelect: openDrawer,
    onZoom: (z) => { if (zoomLevel) zoomLevel.textContent = z + '%'; }
  });
  let currentMap = null;

  // Tabs
  $$('.gen__tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.gen__tab').forEach(t => t.classList.remove('is-active'));
      $$('.gen__tabpane').forEach(p => p.classList.remove('is-active'));
      tab.classList.add('is-active');
      $(`[data-pane="${tab.dataset.tab}"]`).classList.add('is-active');
    });
  });

  // Char count
  const sourceText = $('#sourceText'), charCount = $('#charCount');
  sourceText.addEventListener('input', () => { charCount.textContent = sourceText.value.length + ' characters'; });

  // Sample
  $('#loadSample').addEventListener('click', () => {
    sourceText.value = MindGen.SAMPLE;
    charCount.textContent = sourceText.value.length + ' characters';
  });

  // Topic chips
  $$('.chip').forEach(c => c.addEventListener('click', () => {
    $('#topicInput').value = c.dataset.topic;
  }));

  // File upload
  const dropZone = $('#dropZone'), fileInput = $('#fileInput'), fileInfo = $('#fileInfo');
  let uploadedText = '';
  ['dragenter', 'dragover'].forEach(ev => dropZone.addEventListener(ev, e => { e.preventDefault(); dropZone.classList.add('is-drag'); }));
  ['dragleave', 'drop'].forEach(ev => dropZone.addEventListener(ev, e => { e.preventDefault(); dropZone.classList.remove('is-drag'); }));
  dropZone.addEventListener('drop', e => { if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]); });
  fileInput.addEventListener('change', e => { if (e.target.files[0]) readFile(e.target.files[0]); });

  function readFile(file) {
    fileInfo.hidden = false;
    fileInfo.textContent = 'Reading ' + file.name + '…';
    if (/\.pdf$/i.test(file.name)) {
      // Lightweight PDF text extraction (best-effort, no external libs)
      const reader = new FileReader();
      reader.onload = () => {
        uploadedText = extractPdfText(reader.result) || '';
        if (uploadedText.length < 40) {
          fileInfo.innerHTML = '<b>' + file.name + '</b> — couldn\'t read much text (scanned PDF?). Try pasting the text instead.';
        } else {
          fileInfo.innerHTML = '<b>' + file.name + '</b> — ' + uploadedText.length + ' characters extracted. Ready to generate.';
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        uploadedText = String(reader.result || '');
        fileInfo.innerHTML = '<b>' + file.name + '</b> — ' + uploadedText.length + ' characters. Ready to generate.';
      };
      reader.readAsText(file);
    }
  }

  // Very small PDF text scraper: pulls text inside BT/ET & parentheses/hex strings.
  function extractPdfText(buf) {
    try {
      const bytes = new Uint8Array(buf);
      let s = '';
      for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
      const out = [];
      const re = /\(((?:\\.|[^\\()])*)\)\s*Tj|\[((?:[^\]]|\\.)*)\]\s*TJ/g;
      let m;
      while ((m = re.exec(s)) !== null) {
        let chunk = m[1] || m[2] || '';
        chunk = chunk.replace(/\\([()\\])/g, '$1').replace(/\(([^)]*)\)\s*-?\d*/g, '$1').replace(/[<>]/g, '');
        chunk = chunk.replace(/\\n/g, ' ').replace(/[^\x20-\x7E]/g, ' ');
        if (chunk.trim()) out.push(chunk.trim());
      }
      return out.join(' ').replace(/\s+/g, ' ').trim();
    } catch (e) { return ''; }
  }

  // Loading text cycle
  const mapLoading = $('#mapLoading'), mapLoadingText = $('#mapLoadingText'), mapEmpty = $('#mapEmpty');
  const LOAD_MSGS = ['Reading your resource…', 'Extracting key concepts…', 'Finding connections…', 'Composing your map…'];
  function showLoading(cb) {
    mapEmpty.hidden = true;
    mapLoading.hidden = false;
    let i = 0;
    mapLoadingText.textContent = LOAD_MSGS[0];
    const t = setInterval(() => { i = (i + 1) % LOAD_MSGS.length; mapLoadingText.textContent = LOAD_MSGS[i]; }, 520);
    setTimeout(() => { clearInterval(t); mapLoading.hidden = true; cb(); }, reduce ? 300 : 1650);
  }

  function activeInput() {
    const tab = $('.gen__tab.is-active').dataset.tab;
    if (tab === 'paste') return { type: 'text', value: sourceText.value.trim() };
    if (tab === 'upload') return { type: 'text', value: uploadedText.trim() };
    return { type: 'topic', value: $('#topicInput').value.trim() };
  }

  function buildMap() {
    const inp = activeInput();
    if (inp.type === 'topic') {
      if (!inp.value) { flash('Enter a topic first.'); return null; }
      return MindGen.fromTopic(inp.value);
    }
    if (!inp.value || inp.value.length < 30) { flash('Add a little more text (30+ characters).'); return null; }
    return MindGen.fromText(inp.value);
  }

  const generateBtn = $('#generateBtn');
  generateBtn.addEventListener('click', () => {
    const data = buildMap();
    if (!data) return;
    showLoading(() => {
      currentMap = data;
      map.setData(data.root);
      document.getElementById('generator').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Toolbar actions
  $$('.tool').forEach(btn => btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    if (!currentMap && action !== 'regenerate') { flash('Generate a map first.'); return; }
    switch (action) {
      case 'regenerate': {
        const data = buildMap();
        if (data) showLoading(() => { currentMap = data; map.setData(data.root); });
        break;
      }
      case 'expand': map.expandAll(); flash('Expanded all branches.'); break;
      case 'summarize': summarize(); break;
      case 'explain': explainSelected(); break;
      case 'layout': { const l = map.cycleLayout(); flash('Layout: ' + l); break; }
      case 'export': exportMap(); break;
      case 'save': saveMap(); break;
    }
  }));

  // Zoom controls
  $$('[data-zoom]').forEach(b => b.addEventListener('click', () => {
    const z = b.dataset.zoom;
    if (z === 'in') map.zoomBy(1.2);
    else if (z === 'out') map.zoomBy(1 / 1.2);
    else map.fit();
  }));

  function summarize() {
    if (!currentMap) return;
    const r = currentMap.root;
    const branches = r.children.map(b => b.label);
    openDrawer({
      kind: 'root', label: 'Summary — ' + r.label,
      note: (currentMap.meta.summary || '') + '\n\nThis map covers ' + currentMap.meta.concepts +
        ' concepts across ' + branches.length + ' main branches: ' + branches.join(', ') + '.',
      _tags: branches.slice(0, 6)
    });
  }

  function explainSelected() {
    const id = map.selectedId;
    if (!id) { flash('Click a node, then press Explain.'); return; }
    const node = map._findNode(id);
    if (!node) return;
    const kids = (node.children || []).map(c => c.label);
    openDrawer({
      kind: node.kind, label: node.label,
      note: (node.note || node.label) + (kids.length ? '\n\nRelated ideas: ' + kids.join(', ') + '.' : ''),
      _tags: kids.slice(0, 6)
    });
  }

  function exportMap() {
    if (!currentMap) { flash('Generate a map first.'); return; }
    map.exportPNG((dataUrl) => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = (currentMap.root.label || 'mindmap').replace(/\s+/g, '-').toLowerCase() + '.png';
      a.click();
      flash('Exported as PNG.');
    });
  }

  function saveMap() {
    if (!currentMap) { flash('Generate a map first.'); return; }
    try {
      const saved = JSON.parse(localStorage.getItem('mindmap.saved') || '[]');
      saved.push({ at: Date.now(), title: currentMap.root.label, root: currentMap.root, meta: currentMap.meta });
      localStorage.setItem('mindmap.saved', JSON.stringify(saved.slice(-20)));
      flash('Saved to this browser (' + saved.length + ' total).');
    } catch (e) { flash('Could not save.'); }
  }

  /* ---- Drawer ---- */
  const drawer = $('#drawer');
  function openDrawer(node) {
    $('#drawerKicker').textContent = ({ root: 'Central Topic', branch: 'Main Branch', point: 'Key Point', example: 'Example', key: 'Key Term' })[node.kind] || 'Concept';
    $('#drawerTitle').textContent = node.label;
    $('#drawerBody').textContent = node.note || node.label;
    const tags = node._tags || (node.children || []).map(c => c.label).slice(0, 6);
    $('#drawerTags').innerHTML = tags.map(t => '<span>' + t + '</span>').join('');
    drawer.classList.add('is-open');
  }
  $('#drawerClose').addEventListener('click', () => drawer.classList.remove('is-open'));

  /* ---- Add the Studio's current source as a Storybook chapter ---- */
  $('#addToStoryBtn').addEventListener('click', () => {
    const inp = activeInput();
    if (!isEditing()) backToCurrent();
    if (inp.type === 'topic') {
      if (!inp.value) { flash('Enter a topic first.'); return; }
      if (!activeBook.title) activeBook.title = inp.value;
      addChapter(inp.value, 'topic');
    } else {
      if (!inp.value || inp.value.length < 30) { flash('Add a resource to append (30+ characters).'); return; }
      addChapter(inp.value, 'text');
    }
    flash(activeBook.chapters.length === 1
      ? 'Storybook started from your resource.'
      : 'Added chapter ' + activeBook.chapters.length + ' to your storybook.');
    navigate('storybook');
  });

  /* ---- toast ---- */
  let toast;
  function flash(msg) {
    if (!toast) {
      toast = document.createElement('div');
      toast.style.cssText = 'position:fixed;bottom:26px;left:50%;transform:translateX(-50%) translateY(20px);background:#141417;border:1px solid rgba(201,162,75,.4);color:#f4f1ea;padding:.85rem 1.4rem;border-radius:40px;font-family:var(--mono);font-size:.78rem;letter-spacing:.04em;z-index:9500;opacity:0;transition:opacity .3s,transform .3s;pointer-events:none;box-shadow:0 10px 40px rgba(0,0,0,.5)';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(-50%) translateY(20px)'; }, 2600);
  }
  /* =========================================================
     STORYBOOK — a persistent reading journal.
     One active storybook grows chapter-by-chapter (saved to this
     browser). Press "Finished" to archive it into your collection
     and begin a fresh one. Nothing auto-restarts.
     ========================================================= */
  const storySvg = $('#storySvg'), storyCaption = $('#storyCaption'), storyEmpty = $('#storyEmpty');
  const storyMap = new MindMap(storySvg, { layout: 'radial', animate: !reduce, interactive: true, onSelect: openDrawer });
  const timeline = $('#storyTimeline');
  const composeEl = $('.story__compose');

  const LS = { active: 'mindmap.activeBook', finished: 'mindmap.finishedBooks' };
  let activeBook = { title: '', chapters: [] };   // chapter: { label, dayTitle, value, kind }
  let finishedBooks = [];
  let viewingFinished = null;                       // index into finishedBooks, or null
  let viewingExample = false;                       // read-only demo view
  let storyRoot = null;

  // Read-only example storybook (never persisted, never clobbers your draft)
  const exampleBook = { title: 'Learning', chapters: Storybook.DAYS.map(d => ({ label: d.day, dayTitle: d.title, value: d.text, kind: 'text' })) };
  const isEditing = () => viewingFinished == null && !viewingExample;

  function loadState() {
    try {
      activeBook = JSON.parse(localStorage.getItem(LS.active) || 'null') || { title: '', chapters: [] };
      finishedBooks = JSON.parse(localStorage.getItem(LS.finished) || '[]');
    } catch (e) { activeBook = { title: '', chapters: [] }; finishedBooks = []; }
  }
  function saveState() {
    try {
      localStorage.setItem(LS.active, JSON.stringify(activeBook));
      localStorage.setItem(LS.finished, JSON.stringify(finishedBooks));
    } catch (e) { /* private mode / quota — stay in memory */ }
  }

  const currentView = () => (viewingExample ? exampleBook
    : (viewingFinished == null ? activeBook : finishedBooks[viewingFinished]));
  function clearNew(node) { node.isNew = false; (node.children || []).forEach(clearNew); }
  function countConcepts(node) { let c = 0; (node.children || []).forEach(ch => { c += 1 + countConcepts(ch); }); return c; }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function inferTitle(text) {
    const first = (text.split(/\n/)[0] || '').trim().replace(/^#+\s*/, '');
    if (first && first.length <= 60 && first.length > 3) return first;
    return MindGen.clean(text).split(' ').slice(0, 4).join(' ');
  }

  function mapFor(ch, seedTitle) {
    if (ch.kind === 'topic') return MindGen.fromTopic(seedTitle || ch.value);
    return MindGen.fromText(ch.value, seedTitle ? { title: seedTitle } : undefined);
  }

  function buildStoryUpTo(index) {
    const view = currentView();
    if (!view || !view.chapters.length) { storyRoot = null; return; }
    const seedTitle = view.title || inferTitle(view.chapters[0].value);
    storyRoot = mapFor(view.chapters[0], seedTitle).root;
    for (let d = 1; d <= index; d++) {
      clearNew(storyRoot);                          // only the latest chapter stays highlighted
      MindGen.mergeIntoStory(storyRoot, mapFor(view.chapters[d], null), d);
    }
  }

  function renderTimeline() {
    const view = currentView();
    timeline.innerHTML = '';
    (view ? view.chapters : []).forEach((c, i) => {
      const el = document.createElement('div');
      el.className = 'story__day';
      el.innerHTML = '<span class="story__day-dot"></span><span class="story__day-label">' + c.label + '</span>';
      el.addEventListener('click', () => goToDay(i));
      timeline.appendChild(el);
    });
  }

  function goToDay(index) {
    const view = currentView();
    if (index < 0 || !view || !view.chapters.length) {
      storyRoot = null;
      storyMap.clear();                 // wipe any previously rendered nodes
      storyEmpty.hidden = false; storyCaption.textContent = '';
      renderTimeline();
      return;
    }
    buildStoryUpTo(index);
    storyEmpty.hidden = true;
    storyMap.setData(storyRoot);
    $$('.story__day').forEach((el, i) => {
      el.classList.toggle('is-active', i === index);
      el.classList.toggle('is-done', i < index);
    });
    const c = view.chapters[index];
    const book = isEditing() ? '' : (view.title + ' · ');
    storyCaption.textContent = book + c.label + (c.dayTitle ? ' — ' + c.dayTitle : '');
  }

  function updateUI() {
    const editing = isEditing();
    composeEl.style.display = editing ? '' : 'none';
    $('#storyFinish').style.display = editing ? '' : 'none';
    $('#storyViewing').hidden = editing;
    const n = currentView() ? currentView().chapters.length : 0;
    $('#storyCount').textContent = n + ' chapter' + (n === 1 ? '' : 's');
    if (editing) $('#bookTitle').value = activeBook.title || '';
  }

  // Add a chapter to the ACTIVE storybook and grow the map.
  function addChapter(value, kind) {
    kind = kind || 'text';
    const label = 'Day ' + String(activeBook.chapters.length + 1).padStart(2, '0');
    const dayTitle = kind === 'topic' ? MindGen.titleCase(value) : MindGen.titleCase(inferTitle(value));
    activeBook.chapters.push({ label, dayTitle, value, kind });
    saveState();
    renderTimeline();
    goToDay(activeBook.chapters.length - 1);
    updateUI();
  }

  function finishBook() {
    if (viewingFinished != null) return;
    if (!activeBook.chapters.length) { flash('Add at least one chapter before finishing.'); return; }
    buildStoryUpTo(activeBook.chapters.length - 1);
    const concepts = storyRoot ? countConcepts(storyRoot) : 0;
    const title = MindGen.titleCase(activeBook.title || inferTitle(activeBook.chapters[0].value));
    finishedBooks.unshift({
      title, chapters: activeBook.chapters.slice(),
      days: activeBook.chapters.length, concepts, finishedAt: Date.now()
    });
    activeBook = { title: '', chapters: [] };
    saveState();
    renderShelf();
    $('#bookTitle').value = ''; $('#storyInput').value = '';
    goToDay(-1); updateUI();
    flash('Finished! “' + title + '” saved to your collection.');
    $('#storyCollection').scrollIntoView({ behavior: 'smooth' });
  }

  function revisit(i) {
    viewingExample = false;
    viewingFinished = i;
    renderTimeline();
    goToDay(finishedBooks[i].chapters.length - 1);
    updateUI();
    navigate('storybook');
  }
  function backToCurrent() {
    viewingExample = false;
    viewingFinished = null;
    renderTimeline();
    goToDay(activeBook.chapters.length ? activeBook.chapters.length - 1 : -1);
    updateUI();
  }

  function renderShelf() {
    const shelf = $('#storyShelf'), wrap = $('#storyCollection');
    shelf.innerHTML = '';
    if (!finishedBooks.length) { wrap.hidden = true; return; }
    wrap.hidden = false;
    $('#storyCollectionCount').textContent = finishedBooks.length + ' finished';
    finishedBooks.forEach((bk, i) => {
      const date = new Date(bk.finishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      const el = document.createElement('article');
      el.className = 'book';
      el.innerHTML =
        '<div class="book__ribbon">✓ Completed</div>' +
        '<h4 class="book__title">' + escapeHtml(bk.title) + '</h4>' +
        '<div class="book__meta">' +
          '<div class="book__metric"><b>' + bk.days + '</b><span>Chapters</span></div>' +
          '<div class="book__metric"><b>' + bk.concepts + '</b><span>Concepts</span></div>' +
        '</div>' +
        '<div class="book__foot"><span class="book__date">' + date + '</span>' +
          '<div class="book__actions">' +
            '<button class="book__btn" data-revisit="' + i + '">Revisit →</button>' +
            '<button class="book__btn book__del" data-del="' + i + '">Delete</button>' +
          '</div></div>';
      shelf.appendChild(el);
    });
  }

  function loadExample(gotoIndex) {
    viewingFinished = null;
    viewingExample = true;            // read-only — your saved draft is untouched
    renderTimeline();
    goToDay(gotoIndex == null ? exampleBook.chapters.length - 1 : gotoIndex);
    updateUI();
  }

  /* ---- Storybook events ---- */
  $('#storyAdd').addEventListener('click', () => {
    if (!isEditing()) backToCurrent();
    const val = $('#storyInput').value.trim();
    if (val.length < 30) { flash('Add a bit more text (30+ characters).'); return; }
    const bt = $('#bookTitle').value.trim();
    if (bt) activeBook.title = bt;
    const seeded = activeBook.chapters.length === 0;
    addChapter(val, 'text');
    $('#storyInput').value = '';
    flash(seeded ? 'Storybook started — add another chapter as you keep reading.'
                 : 'Chapter ' + activeBook.chapters.length + ' merged into your storybook.');
  });

  $('#storyFinish').addEventListener('click', finishBook);
  $('#storyBackToCurrent').addEventListener('click', backToCurrent);
  $('#storyExample').addEventListener('click', () => { loadExample(); flash('Loaded a 5-chapter example storybook.'); });
  $('#storyReset').addEventListener('click', () => {
    if (!isEditing()) { backToCurrent(); return; }
    activeBook = { title: '', chapters: [] }; saveState();
    $('#bookTitle').value = ''; $('#storyInput').value = '';
    goToDay(-1); updateUI();
    flash('Draft cleared.');
  });

  $('#storyShelf').addEventListener('click', (e) => {
    const rev = e.target.closest('[data-revisit]');
    const del = e.target.closest('[data-del]');
    if (rev) { revisit(+rev.dataset.revisit); }
    else if (del) {
      const i = +del.dataset.del;
      finishedBooks.splice(i, 1); saveState(); renderShelf();
      if (viewingFinished === i) backToCurrent();
      else if (viewingFinished != null && viewingFinished > i) viewingFinished--;
      flash('Removed from collection.');
    }
  });

  // Restore any saved storybook + collection from this browser.
  loadState();
  renderShelf();
  renderTimeline();
  goToDay(activeBook.chapters.length ? activeBook.chapters.length - 1 : -1);
  updateUI();

  /* =========================================================
     JOURNEY dashboard cards
     ========================================================= */
  const grid = $('#journeyGrid');
  Storybook.DAYS.forEach((d, i) => {
    const nm = MindGen.fromText(d.text);
    const concepts = nm.meta.concepts;
    const card = document.createElement('article');
    card.className = 'jcard reveal';
    card.innerHTML =
      '<div class="jcard__head"><span class="jcard__date">' + d.date + '</span><span class="jcard__day">' + d.day + '</span></div>' +
      '<h3 class="jcard__title">' + d.title + '</h3>' +
      '<p class="jcard__summary">' + d.summary + '</p>' +
      '<div class="jcard__meta">' +
        '<div class="jcard__metric"><b>+' + concepts + '</b><span>Concepts</span></div>' +
        '<div class="jcard__metric"><b>' + d.topics.length + '</b><span>Topics</span></div>' +
      '</div>' +
      '<div class="jcard__topics">' + d.topics.map(t => '<span>' + t + '</span>').join('') + '</div>' +
      '<button class="jcard__btn" data-day="' + i + '">View Mind Map →</button>';
    grid.appendChild(card);
    io.observe(card);
  });
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.jcard__btn');
    if (!btn) return;
    // Journey cards showcase the example journey — load it and jump to that day.
    loadExample(+btn.dataset.day);
    navigate('storybook');
    flash('Opened the example journey.');
  });

  // Refit the visible page's map on resize
  let rT;
  window.addEventListener('resize', () => {
    clearTimeout(rT);
    rT = setTimeout(() => {
      if (currentPage === 'generator' && currentMap) map.fit();
      if (currentPage === 'storybook' && storyRoot) storyMap.fit();
    }, 200);
  });

  /* ---------------------------------------------------------
     Open the initial page (from the URL, else Home)
  --------------------------------------------------------- */
  showPage(PAGES.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home');

})();
