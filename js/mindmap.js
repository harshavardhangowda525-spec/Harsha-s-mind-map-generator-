/* =========================================================
   mindmap.js — interactive SVG mind-map renderer
   Features: radial / tree / horizontal layouts, zoom, pan,
   drag nodes, expand / collapse, node selection, export SVG.
   ========================================================= */
(function (global) {
  'use strict';

  const SVGNS = 'http://www.w3.org/2000/svg';
  const KIND = {
    root:    { fill: '#c9a24b', stroke: '#e0c589', text: '#0a0a0b', r: 0, font: 17, weight: 600, pad: 18 },
    branch:  { fill: '#17171b', stroke: 'rgba(201,162,75,.55)', text: '#f4f1ea', font: 14, weight: 500, pad: 13 },
    point:   { fill: '#101013', stroke: 'rgba(244,241,234,.18)', text: '#d9d5cb', font: 12, weight: 400, pad: 11 },
    example: { fill: '#141210', stroke: 'rgba(224,197,137,.4)', text: '#e0c589', font: 12, weight: 400, pad: 11 },
    key:     { fill: '#0d0d10', stroke: 'rgba(244,241,234,.12)', text: '#b9b4a8', font: 11, weight: 400, pad: 9 }
  };

  function el(name, attrs) {
    const n = document.createElementNS(SVGNS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function MindMap(svg, options) {
    this.svg = svg;
    this.opts = Object.assign({ layout: 'radial', interactive: true, onSelect: null, animate: true }, options || {});
    this.root = null;
    this.scale = 1; this.tx = 0; this.ty = 0;
    this.collapsed = new Set();
    this.dragPos = {};           // id -> {x,y} manual overrides
    this.selectedId = null;
    this.layout = this.opts.layout;
    this._buildScene();
    if (this.opts.interactive) this._bindPanZoom();
  }

  MindMap.prototype._buildScene = function () {
    this.svg.innerHTML = '';
    // defs: gradient + glow
    const defs = el('defs');
    defs.innerHTML =
      '<radialGradient id="rootGrad" cx="35%" cy="30%"><stop offset="0%" stop-color="#f0dca6"/><stop offset="55%" stop-color="#c9a24b"/><stop offset="100%" stop-color="#9c7a34"/></radialGradient>' +
      '<filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<filter id="nodeShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000" flood-opacity="0.45"/></filter>';
    this.svg.appendChild(defs);
    this.gRoot = el('g', { class: 'mm-root' });
    this.gLinks = el('g', { class: 'mm-links' });
    this.gNodes = el('g', { class: 'mm-nodes' });
    this.gRoot.appendChild(this.gLinks);
    this.gRoot.appendChild(this.gNodes);
    this.svg.appendChild(this.gRoot);
  };

  MindMap.prototype.setData = function (root) {
    this.root = root;
    this.collapsed.clear();
    this.dragPos = {};
    this.selectedId = null;
    this.render(true);
  };

  MindMap.prototype.clear = function () {
    this.root = null;
    this._positions = {};
    this.gLinks.innerHTML = '';
    this.gNodes.innerHTML = '';
  };

  MindMap.prototype.setLayout = function (layout) {
    this.layout = layout;
    this.render(true);
  };

  MindMap.prototype.cycleLayout = function () {
    const order = ['radial', 'tree', 'horizontal'];
    const i = order.indexOf(this.layout);
    this.setLayout(order[(i + 1) % order.length]);
    return this.layout;
  };

  /* ---------- layout computation ---------- */
  MindMap.prototype._visibleChildren = function (node) {
    if (this.collapsed.has(node.id)) return [];
    return node.children || [];
  };

  MindMap.prototype._computeLayout = function () {
    const positions = {};
    const links = [];
    const self = this;

    if (this.layout === 'radial') {
      // Assign angular ranges to branches; place descendants along rings.
      const cx = 0, cy = 0;
      positions[this.root.id] = { x: cx, y: cy, node: this.root, depth: 0 };
      const branches = this._visibleChildren(this.root);
      const n = Math.max(branches.length, 1);
      // count leaves for proportional angle
      function leafCount(node) {
        const ch = self._visibleChildren(node);
        if (!ch.length) return 1;
        return ch.reduce((a, c) => a + leafCount(c), 0);
      }
      const totalLeaves = branches.reduce((a, b) => a + leafCount(b), 0) || 1;
      let angleCursor = -Math.PI / 2;
      // radius grows generously per depth to keep wide pill labels from colliding
      const radiusAt = (d) => d === 0 ? 0 : 260 + (d - 1) * 230;

      branches.forEach((branch) => {
        const span = (leafCount(branch) / totalLeaves) * Math.PI * 2;
        const mid = angleCursor + span / 2;
        place(branch, 1, mid, angleCursor, angleCursor + span);
        links.push([this.root.id, branch.id]);
        angleCursor += span;
      });

      function place(node, depth, angle, aMin, aMax) {
        const r = radiusAt(depth);
        positions[node.id] = { x: Math.cos(angle) * r, y: Math.sin(angle) * r, node, depth };
        const ch = self._visibleChildren(node);
        if (!ch.length) return;
        const step = (aMax - aMin) / ch.length;
        ch.forEach((c, i) => {
          const cAngle = aMin + step * (i + 0.5);
          links.push([node.id, c.id]);
          place(c, depth + 1, cAngle, aMin + step * i, aMin + step * (i + 1));
        });
      }
    } else if (this.layout === 'tree') {
      // top-down layered tree
      let leafX = 0;
      const xGap = 150, yGap = 130;
      (function assign(node, depth) {
        const ch = self._visibleChildren(node);
        if (!ch.length) {
          positions[node.id] = { x: leafX * xGap, y: depth * yGap, node, depth };
          leafX++;
          return positions[node.id].x;
        }
        const xs = ch.map(c => { const x = assign(c, depth + 1); links.push([node.id, c.id]); return x; });
        const x = (Math.min(...xs) + Math.max(...xs)) / 2;
        positions[node.id] = { x, y: depth * yGap, node, depth };
        return x;
      })(this.root, 0);
      // center horizontally
      const xs = Object.values(positions).map(p => p.x);
      const mid = (Math.min(...xs) + Math.max(...xs)) / 2;
      Object.values(positions).forEach(p => { p.x -= mid; });
    } else { // horizontal (left-to-right)
      let leafY = 0;
      const xGap = 240, yGap = 78;
      (function assign(node, depth) {
        const ch = self._visibleChildren(node);
        if (!ch.length) {
          positions[node.id] = { x: depth * xGap, y: leafY * yGap, node, depth };
          leafY++;
          return positions[node.id].y;
        }
        const ys = ch.map(c => { const y = assign(c, depth + 1); links.push([node.id, c.id]); return y; });
        const y = (Math.min(...ys) + Math.max(...ys)) / 2;
        positions[node.id] = { x: depth * xGap, y, node, depth };
        return y;
      })(this.root, 0);
      const ys = Object.values(positions).map(p => p.y);
      const mid = (Math.min(...ys) + Math.max(...ys)) / 2;
      Object.values(positions).forEach(p => { p.y -= mid; });
    }

    // apply manual drags
    for (const id in this.dragPos) {
      if (positions[id]) { positions[id].x = this.dragPos[id].x; positions[id].y = this.dragPos[id].y; }
    }
    return { positions, links };
  };

  /* ---------- rendering ---------- */
  MindMap.prototype.render = function (recenter) {
    if (!this.root) return;
    const { positions, links } = this._computeLayout();
    this._positions = positions;
    this.gLinks.innerHTML = '';
    this.gNodes.innerHTML = '';

    // links
    links.forEach(([from, to]) => {
      const a = positions[from], b = positions[to];
      if (!a || !b) return;
      const path = el('path', {
        class: 'link-path',
        d: this._curve(a, b),
        stroke: b.node.isNew ? 'rgba(224,197,137,.7)' : 'rgba(201,162,75,.28)',
        'stroke-width': b.node.kind === 'branch' ? 1.6 : 1,
        opacity: 0
      });
      this.gLinks.appendChild(path);
      if (this.opts.animate) requestAnimationFrame(() => { path.style.transition = 'opacity .8s ease'; path.setAttribute('opacity', 1); });
      else path.setAttribute('opacity', 1);
    });

    // nodes
    const ids = Object.keys(positions);
    ids.forEach((id, i) => {
      const p = positions[id];
      const g = this._nodeEl(p);
      this.gNodes.appendChild(g);
      if (this.opts.animate) {
        // NOTE: never animate CSS `transform` here — it overrides the SVG
        // transform="translate(x,y)" attribute and collapses nodes to origin.
        g.style.opacity = 0;
        setTimeout(() => {
          g.style.transition = 'opacity .55s ease';
          g.style.opacity = 1;
        }, i * 20);
      }
    });

    if (recenter) this.fit();
    else this._applyTransform();
  };

  MindMap.prototype._curve = function (a, b) {
    if (this.layout === 'horizontal') {
      const mx = (a.x + b.x) / 2;
      return `M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
    }
    if (this.layout === 'tree') {
      const my = (a.y + b.y) / 2;
      return `M${a.x},${a.y} C${a.x},${my} ${b.x},${my} ${b.x},${b.y}`;
    }
    // radial: gentle quadratic toward midpoint
    const mx = (a.x + b.x) / 2 + (a.y - b.y) * 0.08;
    const my = (a.y + b.y) / 2 + (b.x - a.x) * 0.08;
    return `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
  };

  MindMap.prototype._measure = function (text, font) {
    // rough width estimate
    return Math.min(text.length * font * 0.56 + 20, 196);
  };

  MindMap.prototype._nodeEl = function (p) {
    const node = p.node;
    const k = KIND[node.kind] || KIND.point;
    const g = el('g', { class: 'node-group', 'data-id': node.id, transform: `translate(${p.x},${p.y})` });

    if (node.kind === 'root') {
      const r = 52;
      g.appendChild(el('circle', { r: r + 12, fill: 'none', stroke: 'rgba(201,162,75,.25)' }));
      g.appendChild(el('circle', { r: r, fill: 'url(#rootGrad)', filter: 'url(#soft)' }));
      this._multiline(g, node.label, 0, 0, r * 1.5, k, true);
    } else {
      const maxChars = Math.floor((196 - 20) / (k.font * 0.56));
      let label = node.label;
      if (label.length > maxChars) label = label.slice(0, maxChars - 1).trimEnd() + '…';
      const w = this._measure(label, k.font);
      const h = k.font + k.pad * 2 - 4;
      const isSel = this.selectedId === node.id;
      const rect = el('rect', {
        class: 'node-rect', x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2,
        fill: node.isNew ? '#1c1710' : k.fill,
        stroke: isSel ? '#c9a24b' : (node.isNew ? '#e0c589' : k.stroke),
        'stroke-width': isSel ? 2 : 1,
        filter: 'url(#nodeShadow)'
      });
      g.appendChild(rect);

      if (node.isNew) {
        g.appendChild(el('circle', { cx: w / 2 - 4, cy: -h / 2 + 4, r: 4, fill: '#e0c589' }));
      }

      const t = el('text', {
        class: 'node-label', x: 0, y: 0, 'text-anchor': 'middle',
        'dominant-baseline': 'central', 'font-size': k.font, 'font-weight': k.weight, fill: k.text
      });
      t.textContent = label;
      g.appendChild(t);

      // collapse indicator
      const hidden = (node.children && node.children.length) ? true : false;
      if (hidden) {
        const isCol = this.collapsed.has(node.id);
        const badge = el('g', { class: 'node-collapse-badge', transform: `translate(${w / 2 + 6},0)` });
        badge.appendChild(el('circle', { r: 8, fill: '#0a0a0b', stroke: 'rgba(201,162,75,.5)' }));
        const sign = el('text', { class: 'node-collapse', 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 11 });
        sign.textContent = isCol ? '+' : '−';
        badge.appendChild(sign);
        g.appendChild(badge);
      }
    }

    if (this.opts.interactive) this._bindNode(g, node, p);
    return g;
  };

  MindMap.prototype._multiline = function (g, text, x, y, maxW, k, center) {
    const words = text.split(' ');
    const lines = [];
    let cur = '';
    words.forEach(w => {
      if ((cur + ' ' + w).length * k.font * 0.5 > maxW && cur) { lines.push(cur); cur = w; }
      else cur = cur ? cur + ' ' + w : w;
    });
    if (cur) lines.push(cur);
    const lh = k.font * 1.15;
    const startY = y - (lines.length - 1) * lh / 2;
    lines.forEach((ln, i) => {
      const t = el('text', {
        class: 'node-label', x, y: startY + i * lh, 'text-anchor': 'middle',
        'dominant-baseline': 'central', 'font-size': k.font, 'font-weight': k.weight, fill: k.text
      });
      t.textContent = ln;
      g.appendChild(t);
    });
  };

  /* ---------- interactions ---------- */
  MindMap.prototype._bindNode = function (g, node, p) {
    const self = this;
    let moved = false, downX = 0, downY = 0, dragging = false, start = null;

    let onBadge = false;
    const onDown = (e) => {
      e.stopPropagation();
      moved = false; dragging = true;
      onBadge = !!(e.target.closest && e.target.closest('.node-collapse-badge'));
      const pt = self._evtPoint(e);
      start = { px: p.x, py: p.y, mx: pt.x, my: pt.y };
      downX = pt.x; downY = pt.y;
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    };
    const onMove = (e) => {
      if (!dragging) return;
      const pt = self._evtPoint(e);
      const dx = (pt.x - start.mx) / self.scale;
      const dy = (pt.y - start.my) / self.scale;
      if (Math.abs(pt.x - downX) + Math.abs(pt.y - downY) > 4) moved = true;
      self.dragPos[node.id] = { x: start.px + dx, y: start.py + dy };
      p.x = start.px + dx; p.y = start.py + dy;
      g.setAttribute('transform', `translate(${p.x},${p.y})`);
      self._redrawLinks();
    };
    const onUp = (e) => {
      dragging = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (!moved) {
        // click on +/- badge toggles children; anywhere else selects the node
        if (onBadge && node.children && node.children.length) {
          self.toggle(node.id);
        } else {
          self.select(node.id);
        }
      }
    };
    g.addEventListener('pointerdown', onDown);
  };

  MindMap.prototype.toggle = function (id) {
    if (this.collapsed.has(id)) this.collapsed.delete(id);
    else this.collapsed.add(id);
    this.render(false);
  };

  MindMap.prototype.select = function (id) {
    this.selectedId = id;
    this.render(false);
    const node = this._findNode(id);
    if (node && this.opts.onSelect) this.opts.onSelect(node);
  };

  MindMap.prototype._findNode = function (id, node) {
    node = node || this.root;
    if (node.id === id) return node;
    for (const c of (node.children || [])) {
      const f = this._findNode(id, c);
      if (f) return f;
    }
    return null;
  };

  MindMap.prototype.expandAll = function () {
    this.collapsed.clear();
    this.render(true);
  };
  MindMap.prototype.collapseAll = function () {
    const self = this;
    (function walk(n, depth) {
      if (depth >= 1 && n.children && n.children.length) self.collapsed.add(n.id);
      (n.children || []).forEach(c => walk(c, depth + 1));
    })(this.root, 0);
    this.render(true);
  };

  MindMap.prototype._redrawLinks = function () {
    const links = this.gLinks.querySelectorAll('path');
    // recompute from positions
    const pos = this._positions;
    let i = 0;
    const self = this;
    const all = [];
    (function collect(node) {
      self._visibleChildren(node).forEach(c => { all.push([node.id, c.id]); collect(c); });
    })(this.root);
    all.forEach(([from, to]) => {
      const a = pos[from], b = pos[to];
      if (a && b && links[i]) links[i].setAttribute('d', self._curve(a, b));
      i++;
    });
  };

  /* ---------- pan / zoom ---------- */
  MindMap.prototype._evtPoint = function (e) {
    const r = this.svg.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  MindMap.prototype._bindPanZoom = function () {
    const self = this;
    let panning = false, startX = 0, startY = 0, baseTx = 0, baseTy = 0;

    this.svg.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.node-group')) return;
      panning = true;
      const pt = self._evtPoint(e);
      startX = pt.x; startY = pt.y; baseTx = self.tx; baseTy = self.ty;
    });
    window.addEventListener('pointermove', (e) => {
      if (!panning) return;
      const pt = self._evtPoint(e);
      self.tx = baseTx + (pt.x - startX);
      self.ty = baseTy + (pt.y - startY);
      self._applyTransform();
    });
    window.addEventListener('pointerup', () => { panning = false; });

    this.svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const pt = self._evtPoint(e);
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      self.zoomAt(pt.x, pt.y, factor);
    }, { passive: false });

    // pinch
    let pinch = null;
    this.svg.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const mid = self._evtPoint({ clientX: (e.touches[0].clientX + e.touches[1].clientX) / 2, clientY: (e.touches[0].clientY + e.touches[1].clientY) / 2 });
        if (pinch) self.zoomAt(mid.x, mid.y, dist / pinch);
        pinch = dist;
        e.preventDefault();
      }
    }, { passive: false });
    this.svg.addEventListener('touchend', () => { pinch = null; });
  };

  MindMap.prototype.zoomAt = function (px, py, factor) {
    const newScale = Math.max(0.25, Math.min(3, this.scale * factor));
    const k = newScale / this.scale;
    this.tx = px - (px - this.tx) * k;
    this.ty = py - (py - this.ty) * k;
    this.scale = newScale;
    this._applyTransform();
  };

  MindMap.prototype.zoomBy = function (factor) {
    const r = this.svg.getBoundingClientRect();
    this.zoomAt(r.width / 2, r.height / 2, factor);
  };

  MindMap.prototype._applyTransform = function () {
    this.gRoot.setAttribute('transform', `translate(${this.tx},${this.ty}) scale(${this.scale})`);
    if (this.opts.onZoom) this.opts.onZoom(Math.round(this.scale * 100));
  };

  MindMap.prototype.fit = function () {
    const pos = this._positions || {};
    const pts = Object.values(pos);
    if (!pts.length) return;
    const r = this.svg.getBoundingClientRect();
    const W = r.width || 800, H = r.height || 600;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    pts.forEach(p => {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    });
    const pad = 120;
    const bw = (maxX - minX) + pad * 2, bh = (maxY - minY) + pad * 2;
    const scale = Math.max(0.18, Math.min(1.4, Math.min(W / bw, H / bh)));
    this.scale = scale;
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    this.tx = W / 2 - cx * scale;
    this.ty = H / 2 - cy * scale;
    this._applyTransform();
  };

  /* ---------- export ---------- */
  MindMap.prototype.exportSVG = function () {
    const clone = this.svg.cloneNode(true);
    clone.setAttribute('xmlns', SVGNS);
    const r = this.svg.getBoundingClientRect();
    clone.setAttribute('width', r.width);
    clone.setAttribute('height', r.height);
    const bg = el('rect', { x: 0, y: 0, width: r.width, height: r.height, fill: '#0a0a0b' });
    clone.insertBefore(bg, clone.firstChild);
    const str = new XMLSerializer().serializeToString(clone);
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str);
  };

  MindMap.prototype.exportPNG = function (cb) {
    const url = this.exportSVG();
    const r = this.svg.getBoundingClientRect();
    const img = new Image();
    img.onload = function () {
      const c = document.createElement('canvas');
      const scale = 2;
      c.width = r.width * scale; c.height = r.height * scale;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#0a0a0b'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      cb(c.toDataURL('image/png'));
    };
    img.onerror = function () { cb(url); };
    img.src = url;
  };

  global.MindMap = MindMap;

})(typeof window !== 'undefined' ? window : this);
