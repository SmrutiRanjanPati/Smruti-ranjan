// ============ FOOTER YEAR ============
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ============ REDUCED MOTION PREFERENCE ============
// Used to skip purely decorative, JS-driven motion (the hero globe,
// magnetic buttons, tilt, custom cursor tracking) for people who've asked
// their OS for less motion. CSS transitions/animations already respect this
// via the prefers-reduced-motion media query in style.css - this covers the
// motion that's driven from JS instead.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============ THEME TOGGLE ============
// (Initial theme is already applied by the inline blocking script in <head>
// so there's no flash-of-wrong-theme on load.)
(function initThemeToggle(){
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('sr-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('sr-theme', 'light');
    }
    toggle.classList.add('spin');
    setTimeout(() => toggle.classList.remove('spin'), 350);
  });

  // Keep in sync if the user has multiple tabs open
  window.addEventListener('storage', (e) => {
    if (e.key !== 'sr-theme') return;
    if (e.newValue === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
  });
})();

// ============ TOPNAV SCROLL STATE ============
const topnav = document.getElementById('topnav');
if (topnav) {
  window.addEventListener('scroll', () => {
    topnav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ============ ACTIVE SECTION TRACKING (nav + tabbar) ============
const sections = ['top','about','Career','work','skills','contact'];
const navLinks = document.querySelectorAll('.nav-links a');
const tabItems = document.querySelectorAll('.tab-item');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(a => a.classList.toggle('active', a.dataset.section === id));
      tabItems.forEach(t => t.classList.toggle('active', t.dataset.section === id));
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });

sections.forEach(id => {
  const el = document.getElementById(id);
  if (el) sectionObserver.observe(el);
});

// ============ SCROLL REVEAL ============
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

function observeReveals(root = document) {
  root.querySelectorAll('.reveal:not(.in)').forEach(el => revealObserver.observe(el));
}
observeReveals();

// ============ ANIMATED COUNTERS ============
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.target, 10);
    const duration = 1100;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

// ============ CUSTOM CURSOR ============
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

if (cursorDot && cursorRing && !prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  function bindCursorHover(root = document) {
    root.querySelectorAll('a, button, .work-tile, .pill').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
    });
  }
  bindCursorHover();
  window.__bindCursorHover = bindCursorHover;
}

// ============ MAGNETIC BUTTONS ============
function bindMagnetic(root = document) {
  if (prefersReducedMotion) return;
  root.querySelectorAll('.magnetic').forEach(btn => {
    if (btn.__magneticBound) return;
    btn.__magneticBound = true;
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}
bindMagnetic();

// ============ 3D TILT (cards + work tiles) ============
// will-change is added only while a tilt interaction is actually happening
// (rather than permanently in CSS) so the browser isn't holding every card
// and work tile on its own composited layer all the time - that adds up on
// long pages, especially on lower-end mobile GPUs.
function bindTilt(root = document) {
  if (prefersReducedMotion) return;
  root.querySelectorAll('.card, .work-tile').forEach(card => {
    if (card.__tiltBound) return;
    card.__tiltBound = true;
    card.addEventListener('mouseenter', () => { card.style.willChange = 'transform'; });
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${py * -3}deg) rotateY(${px * 3}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.willChange = 'auto';
    });
  });
}
bindTilt();

// ============ COPY-LINK / SHARE HELPERS ============
function absoluteUrl(path) {
  return new URL(path, window.location.href).href;
}

function flashCopied(btn) {
  btn.classList.add('copied');
  setTimeout(() => btn.classList.remove('copied'), 1600);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older/blocked clipboard API
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return true;
  }
}

function bindCopyButtons(root = document) {
  root.querySelectorAll('.copy-btn[data-path]').forEach(btn => {
    if (btn.__copyBound) return;
    btn.__copyBound = true;
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const url = absoluteUrl(btn.dataset.path);
      await copyText(url);
      flashCopied(btn);
    });
  });
}
bindCopyButtons();

// ============ VISUAL MOCK RENDERER (shared by work grid + case study) ============
function renderVisualMock(type) {
  switch (type) {
    case 'bars':
      return `<div class="mock-bars">
        <span style="--h:40%"></span><span style="--h:70%"></span><span style="--h:55%"></span>
        <span style="--h:90%"></span><span style="--h:60%"></span><span style="--h:35%"></span>
      </div>`;
    case 'components':
      return `<div class="mock-components"><span></span><span></span><span></span><span></span></div>`;
    case 'map':
      return `<div class="mock-map">
        <span class="cell" style="--o:.9"></span><span class="cell" style="--o:.4"></span><span class="cell" style="--o:.6"></span>
        <span class="cell" style="--o:.3"></span><span class="cell" style="--o:.8"></span><span class="cell" style="--o:.5"></span>
        <span class="cell" style="--o:.7"></span><span class="cell" style="--o:.2"></span><span class="cell" style="--o:.6"></span>
      </div>`;
    case 'flow':
      return `<div class="mock-flow"><span class="node"></span><span class="line"></span><span class="node"></span><span class="line"></span><span class="node"></span></div>`;
    default:
      return '';
  }
}
const visualClassByIndex = ['work-visual--1', 'work-visual--2', 'work-visual--3', 'work-visual--4'];
function visualClassFor(type) {
  const map = { bars: 'work-visual--1', components: 'work-visual--2', map: 'work-visual--3', flow: 'work-visual--4' };
  return map[type] || visualClassByIndex[0];
}

// Minimal hardcoded fallback so the site is never a dead end if case-studies.json
// can't be fetched (e.g. opened straight from disk via file:// without a local server).
const FALLBACK_CASE_STUDIES = [
  { id: 'ai-dashboard', title: 'AI-Driven Analytics Dashboard' },
  { id: 'design-system', title: 'Enterprise Design System' },
  { id: 'discrepancy-reporting', title: 'Discrepancy Reporting Suite' },
  { id: 'metrics-monitor', title: 'Metrics Refresh Monitor' },
];

async function loadCaseStudies() {
  const res = await fetch('case-studies.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load case-studies.json (' + res.status + ')');
  return res.json();
}

// ============ FEATURED WORK GRID (index page, JSON-driven) ============
(function initWorkGrid() {
  const grid = document.getElementById('workGrid');
  if (!grid) return;

  loadCaseStudies().then(data => {
    grid.innerHTML = data.caseStudies.map(cs => `
      <div class="work-tile tilt" tabindex="0" role="link"
           aria-label="View case study: ${cs.title}"
           data-href="case-study.html?id=${encodeURIComponent(cs.id)}">
        <div class="work-visual ${visualClassFor(cs.visuals[0])}">
          ${renderVisualMock(cs.visuals[0])}
        </div>
        <div class="work-info">
          <h3>${cs.title}</h3>
          <p>${cs.cardSummary}</p>
          <span class="work-tag">${cs.tag}</span>
          <div class="work-actions">
            <a class="work-link magnetic" href="case-study.html?id=${encodeURIComponent(cs.id)}">View case study →</a>
            <button class="copy-btn" data-path="case-study.html?id=${encodeURIComponent(cs.id)}" title="Copy case study link" aria-label="Copy case study link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
              <span class="copy-toast">Link copied</span>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Whole-card click-to-open, without hijacking clicks on the link/copy button
    grid.querySelectorAll('.work-tile').forEach(tile => {
      tile.addEventListener('click', (e) => {
        if (e.target.closest('.work-actions')) return;
        window.location.href = tile.dataset.href;
      });
      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') window.location.href = tile.dataset.href;
      });
    });

    bindCopyButtons(grid);
    bindMagnetic(grid);
    bindTilt(grid);
    if (window.__bindCursorHover) window.__bindCursorHover(grid);
    observeReveals(grid);
  }).catch(() => {
    grid.innerHTML = `
      <div class="cs-state" style="grid-column:1/-1;">
        <h3>Couldn't load projects from case-studies.json</h3>
        <p>If you're viewing this straight from a folder on disk, browsers block that fetch for security. Serve the folder with a local server, or upload it to any static host - it'll work immediately.</p>
        <div class="fallback-links">
          ${FALLBACK_CASE_STUDIES.map(cs => `<a class="btn btn-outline" href="case-study.html?id=${cs.id}">${cs.title}</a>`).join('')}
        </div>
      </div>`;
  });
})();

// ============ CASE STUDY TEMPLATE PAGE (case-study.html, JSON-driven) ============
(function initCaseStudyPage() {
  const root = document.getElementById('csRoot');
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const stateEl = document.getElementById('csState');
  const contentEl = document.getElementById('csContent');

  function showState(html) {
    stateEl.innerHTML = html;
    stateEl.hidden = false;
    contentEl.hidden = true;
  }

  if (!id) {
    showState(`
      <div class="cs-state">
        <h3>No project specified</h3>
        <p>Pick a project from the portfolio to view its case study.</p>
        <div class="fallback-links"><a class="btn btn-solid" href="index.html#work">Back to portfolio</a></div>
      </div>`);
    return;
  }

  loadCaseStudies().then(data => {
    const cs = data.caseStudies.find(c => c.id === id);
    if (!cs) {
      showState(`
        <div class="cs-state">
          <h3>Project not found</h3>
          <p>"${id}" doesn't match any case study. It may have moved.</p>
          <div class="fallback-links">
            ${FALLBACK_CASE_STUDIES.map(f => `<a class="btn btn-outline" href="case-study.html?id=${f.id}">${f.title}</a>`).join('')}
          </div>
        </div>`);
      return;
    }

    const site = data.site;
    const permalink = absoluteUrl(`case-study.html?id=${encodeURIComponent(cs.id)}`);

    document.title = `${cs.title} - Case Study by ${site.name}`;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) descMeta.setAttribute('content', cs.description);

    document.getElementById('csEyebrow').textContent = cs.eyebrow;
    document.getElementById('csTitle').textContent = cs.title;
    document.getElementById('csSummary').textContent = cs.summary;

    document.getElementById('csMetaGrid').innerHTML = `
      <div class="cs-meta-item"><h4>Role</h4><p>${cs.role}</p></div>
      <div class="cs-meta-item"><h4>Client / Team</h4><p>${cs.client}</p></div>
      <div class="cs-meta-item"><h4>Timeline</h4><p>${cs.timeline}</p></div>
      <div class="cs-meta-item"><h4>Tools</h4><p>${cs.tools}</p></div>
    `;

    document.getElementById('csChallenge').innerHTML = cs.challenge.map(p => `<p class="about-text">${p}</p>`).join('');
    document.getElementById('csProcess').innerHTML = cs.process.map(li => `<li>${li}</li>`).join('');
    document.getElementById('csSolution').innerHTML = cs.solution.map(p => `<p class="about-text">${p}</p>`).join('');
    document.getElementById('csResults').innerHTML = cs.results.map(p => `<p class="about-text">${p}</p>`).join('');

    document.getElementById('csVisualStrip').innerHTML = cs.visuals.map(v => `
      <div class="work-visual ${visualClassFor(v)}">${renderVisualMock(v)}</div>
    `).join('');

    // Share row: copy link + LinkedIn + X + Email
    const shareCopyBtn = document.getElementById('shareCopyBtn');
    shareCopyBtn.dataset.path = `case-study.html?id=${encodeURIComponent(cs.id)}`;
    bindCopyButtons(document);

    const shareText = `${cs.title} - a case study by ${site.name}`;
    document.getElementById('shareLinkedIn').href =
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(permalink)}`;
    document.getElementById('shareTwitter').href =
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(permalink)}&text=${encodeURIComponent(shareText)}`;
    document.getElementById('shareEmail').href =
      `mailto:?subject=${encodeURIComponent(cs.title + ' - Case Study')}&body=${encodeURIComponent(shareText + '\n\n' + permalink)}`;

    stateEl.hidden = true;
    contentEl.hidden = false;
    contentEl.querySelectorAll('.reveal').forEach(el => requestAnimationFrame(() => el.classList.add('in')));

    bindMagnetic(contentEl);
    bindTilt(contentEl);
    if (window.__bindCursorHover) window.__bindCursorHover(contentEl);
  }).catch(() => {
    showState(`
      <div class="cs-state">
        <h3>Couldn't load this case study</h3>
        <p>If you're viewing this straight from a folder on disk, browsers block loading case-studies.json for security. Serve the folder with a local server (e.g. <code>npx serve</code>), or upload it to any static host - it'll work immediately.</p>
        <div class="fallback-links"><a class="btn btn-solid" href="index.html#work">Back to portfolio</a></div>
      </div>`);
  });
})();

const OFFSET = 80;

function smoothScrollWithOffset(e) {
  const href = this.getAttribute("href");

  // Ignore links to other pages
  if (!href.startsWith("#")) return;

  e.preventDefault();

  const target = document.querySelector(href);

  if (!target) return;

  const top =
    target.getBoundingClientRect().top +
    window.pageYOffset -
    OFFSET;

  window.scrollTo({
    top,
    behavior: "smooth",
  });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", smoothScrollWithOffset);
});

// ── Disable right-click context menu ──
document.addEventListener('contextmenu', e => e.preventDefault());

// ============ DINO GAME — Complete Rewrite ============
(function initDinoGame() {
  const canvas  = document.getElementById('dinoCanvas');
  const scoreEl = document.getElementById('dinoScore');
  const jumpBtn = document.getElementById('dinoJumpBtn');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // ── CSS variable reader ──
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#fff';
  }

  // ── Constants ──
  const DINO_W      = 22;
  const DINO_H      = 30;
  const JUMP_V      = -12.5;
  const GRAVITY     = 0.58;
  const BASE_SPEED  = 4.5;
  const MAX_SPEED   = 14;

  // ── State ──
  let W, H, groundY;
  let dino, obstacles, particles;
  let score, hiScore, speed, frame;
  let phase; // 'start' | 'running' | 'dead' | 'restart'
  let animId;
  let startPulse = 0;
  let deathFrame = 0;

  hiScore = 0;

  // ── Resize ──
  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = Math.round(W * devicePixelRatio);
    canvas.height = Math.round(H * devicePixelRatio);
    ctx.scale(devicePixelRatio, devicePixelRatio);
    groundY = H - 14;
  }

  // ── Init / Reset ──
  function initDino() {
    dino = {
      x: W * 0.10,
      y: groundY - DINO_H,
      vy: 0,
      onGround: true,
      legPhase: 0,
    };
  }

  function resetGame() {
    obstacles  = [];
    particles  = [];
    score      = 0;
    speed      = BASE_SPEED;
    frame      = 0;
    deathFrame = 0;
    initDino();
    phase = 'running';
  }

  // ── Jump ──
  function tryJump() {
    if (phase === 'start') {
      resetGame();
      return;
    }
    if (phase === 'running' && dino.onGround) {
      dino.vy = JUMP_V;
      dino.onGround = false;
      spawnDustParticles(dino.x + DINO_W / 2, groundY);
    }
    if (phase === 'dead' && deathFrame > 40) {
      phase = 'restart';
      // Brief pause then restart
      setTimeout(() => resetGame(), 180);
    }
  }

  // ── Input bindings ──
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      if (canvas.closest('.profile-card')) {
        e.preventDefault();
        tryJump();
      }
    }
  });
  canvas.addEventListener('click',      tryJump);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); tryJump(); }, { passive: false });
  jumpBtn?.addEventListener('click',     tryJump);
  jumpBtn?.addEventListener('touchstart',(e) => { e.preventDefault(); tryJump(); }, { passive: false });

  // ── Particles ──
  function spawnDustParticles(x, y) {
    for (let i = 0; i < 6; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 2.5,
        life: 1,
        r: 2 + Math.random() * 3,
      });
    }
  }

  function spawnDeathParticles() {
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      particles.push({
        x: dino.x + DINO_W / 2,
        y: dino.y + DINO_H / 2,
        vx: Math.cos(angle) * (2 + Math.random() * 4),
        vy: Math.sin(angle) * (2 + Math.random() * 4),
        life: 1,
        r: 3 + Math.random() * 4,
        color: cssVar('--amber'),
      });
    }
  }

  // ── Obstacle spawner ──
  function spawnObstacle() {
    const h = 18 + Math.random() * 24;
    const w = 10 + Math.random() * 8;
    // Occasionally spawn double cactus
    const count = score > 300 && Math.random() < 0.35 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      obstacles.push({
        x: W + i * (w + 8),
        y: groundY - h,
        w, h,
        hue: Math.random() < 0.5 ? 0 : 1, // variety
      });
    }
  }

  // ── Collision ──
  function hits(ob) {
    const pad = 5;
    return !(
      dino.x + DINO_W - pad < ob.x      + pad ||
      dino.x             + pad > ob.x + ob.w - pad ||
      dino.y + DINO_H    - pad < ob.y      + pad ||
      dino.y             + pad > ob.y + ob.h - pad
    );
  }

  // ── Drawing helpers ──

  function drawGround() {
    // Solid ground line
    ctx.strokeStyle = cssVar('--border-strong');
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, groundY + DINO_H + 2);
    ctx.lineTo(W, groundY + DINO_H + 2);
    ctx.stroke();

    // Moving dots on ground
    ctx.fillStyle = cssVar('--border');
    const dotSpacing = 40;
    const offset = (frame * speed * 0.5) % dotSpacing;
    for (let x = -offset; x < W + dotSpacing; x += dotSpacing) {
      ctx.beginPath();
      ctx.arc(x, groundY + DINO_H + 7, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawDino(dead) {
    const ink  = dead ? cssVar('--amber') : cssVar('--text');
    const eye  = dead ? '#fff'            : cssVar('--void');
    const x    = dino.x;
    const y    = dino.y;

    // Shadow
    const shadowAlpha = dino.onGround ? 0.18 : Math.max(0, 0.18 - (groundY - DINO_H - dino.y) / (groundY * 2));
    ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
    ctx.beginPath();
    const shadowW = DINO_W * (dino.onGround ? 1 : 0.7);
    ctx.ellipse(x + DINO_W / 2, groundY + DINO_H + 2, shadowW / 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = ink;

    // Body
    ctx.beginPath();
    ctx.roundRect(x, y + 8, DINO_W, DINO_H - 8, 4);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.roundRect(x + 7, y, 15, 14, 3);
    ctx.fill();

    // Mouth / beak
    ctx.fillStyle = dead ? cssVar('--void') : cssVar('--surface');
    ctx.beginPath();
    ctx.roundRect(x + 18, y + 7, 6, 3, 1);
    ctx.fill();

    // Eye
    ctx.fillStyle = eye;
    ctx.beginPath();
    ctx.arc(x + 18, y + 4, dead ? 3 : 2.5, 0, Math.PI * 2);
    ctx.fill();
    if (dead) {
      // X eyes
      ctx.strokeStyle = ink;
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + 16, y + 2); ctx.lineTo(x + 20, y + 6);
      ctx.moveTo(x + 20, y + 2); ctx.lineTo(x + 16, y + 6);
      ctx.stroke();
    }

    // Tail
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(x, y + 14);
    ctx.lineTo(x - 7, y + 18);
    ctx.lineTo(x, y + 22);
    ctx.closePath();
    ctx.fill();

    // Legs — animated when running
    if (!dead) {
      const leg = dino.onGround ? Math.sin(dino.legPhase) : 0;
      ctx.fillRect(x + 4,  y + DINO_H, 5, 6 + leg * 3);
      ctx.fillRect(x + 12, y + DINO_H, 5, 6 - leg * 3);
    } else {
      ctx.fillRect(x + 4,  y + DINO_H, 5, 6);
      ctx.fillRect(x + 12, y + DINO_H, 5, 6);
    }
  }

  function drawCactus(ob) {
    const col = ob.hue === 0 ? cssVar('--cyan') : cssVar('--violet');

    ctx.fillStyle = col;
    // Main trunk
    ctx.beginPath();
    ctx.roundRect(ob.x + ob.w * 0.3, ob.y, ob.w * 0.42, ob.h, 3);
    ctx.fill();

    // Left arm
    ctx.beginPath();
    ctx.roundRect(ob.x, ob.y + ob.h * 0.28, ob.w * 0.36, ob.h * 0.32, 2);
    ctx.fill();
    // Left arm top
    ctx.beginPath();
    ctx.roundRect(ob.x, ob.y + ob.h * 0.12, ob.w * 0.14, ob.h * 0.2, 2);
    ctx.fill();

    // Right arm
    ctx.beginPath();
    ctx.roundRect(ob.x + ob.w * 0.64, ob.y + ob.h * 0.38, ob.w * 0.36, ob.h * 0.28, 2);
    ctx.fill();
    // Right arm top
    ctx.beginPath();
    ctx.roundRect(ob.x + ob.w * 0.86, ob.y + ob.h * 0.2, ob.w * 0.14, ob.h * 0.22, 2);
    ctx.fill();
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle   = p.color || cssVar('--border-strong');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawScore() {
    ctx.font      = `500 11px ${cssVar('--font-mono') || 'monospace'}`;
    ctx.fillStyle = cssVar('--text-faint');
    ctx.textAlign = 'left';
    ctx.fillText(Math.floor(score).toString().padStart(5, '0'), 10, 16);
  }

  // ── START SCREEN ──
  function drawStartScreen() {
    startPulse += 0.04;

    // Animated grid lines
    ctx.strokeStyle = cssVar('--border');
    ctx.lineWidth   = 0.5;
    ctx.setLineDash([3, 6]);
    const gridOff = (frame * 0.8) % 40;
    for (let x = -gridOff; x < W; x += 40) {
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);

    // Floating score hint
    const hint = ['0', '1', '0', '0'].map((n, i) => {
      const t = startPulse + i * 0.5;
      return { n, y: H * 0.35 + Math.sin(t) * 4, x: W * 0.5 + (i - 1.5) * 16 };
    });
    hint.forEach(h => {
      ctx.font      = `700 14px ${cssVar('--font-mono') || 'monospace'}`;
      ctx.fillStyle = cssVar('--cyan');
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.18 + Math.sin(startPulse) * 0.08;
      ctx.fillText(h.n, h.x, h.y);
    });
    ctx.globalAlpha = 1;

    // Dino with bobbing motion
    dino.y = groundY - DINO_H + Math.sin(startPulse * 1.5) * 3;
    drawDino(false);
    drawGround();

    // Title
    ctx.font      = `700 13px ${cssVar('--font-display') || 'sans-serif'}`;
    ctx.fillStyle = cssVar('--text');
    ctx.textAlign = 'center';
    ctx.fillText('DINO RUN', W / 2, groundY - 24);

    // Pulsing prompt
    const alpha = 0.5 + Math.sin(startPulse * 3) * 0.5;
    ctx.font      = `500 10px ${cssVar('--font-mono') || 'monospace'}`;
    ctx.fillStyle = cssVar('--cyan');
    ctx.globalAlpha = alpha;
    ctx.fillText(
      window.matchMedia('(hover:none)').matches ? '▲  TAP TO START' : '▲  SPACE / CLICK TO START',
      W / 2, groundY - 10
    );
    ctx.globalAlpha = 1;

    // Animated cactus preview on right
    const previewX = W * 0.82 + Math.sin(startPulse * 0.8) * 4;
    drawCactus({ x: previewX, y: groundY - 28, w: 14, h: 28, hue: 0 });
  }

  // ── GAME OVER SCREEN ──
  function drawDeadScreen() {
    deathFrame++;
    const reveal = Math.min(deathFrame / 25, 1);

    drawGround();
    drawParticles();
    drawDino(true);

    // Slide-in overlay
    ctx.globalAlpha = reveal * 0.65;
    ctx.fillStyle   = cssVar('--void');
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    if (reveal > 0.6) {
      const a = (reveal - 0.6) / 0.4;

      // GAME OVER text
      // Centre everything around the middle of the canvas
      const midY = H / 2;

      ctx.font      = `800 13px ${cssVar('--font-display') || 'sans-serif'}`;
      ctx.fillStyle = cssVar('--amber');
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', W / 2, midY - 26);

      // HI score (left) + SCORE (right) on same line
      ctx.font = `500 10px ${cssVar('--font-mono') || 'monospace'}`;

      // Left — HI score
      ctx.fillStyle = cssVar('--cyan');
      ctx.textAlign = 'left';
      ctx.fillText(`HI  ${Math.floor(hiScore).toString().padStart(5, '0')}`, W / 2 - 65, midY - 4);

      // Vertical divider
      ctx.strokeStyle = cssVar('--border-strong');
      ctx.lineWidth   = 0.8;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(W / 2, midY - 14);
      ctx.lineTo(W / 2, midY + 4);
      ctx.stroke();

      // Right — current SCORE
      ctx.fillStyle = cssVar('--text-muted');
      ctx.textAlign = 'right';
      ctx.fillText(`SCORE  ${Math.floor(score).toString().padStart(5, '0')}`, W / 2 + 80, midY - 4);

      // Reset align
      ctx.textAlign = 'center';

      // Restart hint (pulsing after pause)
      if (deathFrame > 40) {
        const pulse = 0.5 + Math.sin((deathFrame - 40) * 0.15) * 0.5;
        ctx.globalAlpha = a * pulse;
        ctx.font      = `500 9px ${cssVar('--font-mono') || 'monospace'}`;
        ctx.fillStyle = cssVar('--text-faint');
        ctx.fillText(
          window.matchMedia('(hover:none)').matches ? '▲  TAP TO RESTART' : '▲  SPACE / CLICK TO RESTART',
          W / 2, midY + 28
        );
      }
      ctx.globalAlpha = 1;
    }

    drawScore();
  }

  // ── MAIN LOOP ──
  function loop() {
    // Clear at logical resolution
    ctx.clearRect(0, 0, W, H);

    if (phase === 'start') {
      frame++;
      drawStartScreen();
      animId = requestAnimationFrame(loop);
      return;
    }

    if (phase === 'dead' || phase === 'restart') {
      // Update particles even in dead state
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life -= 0.04;
      });
      particles = particles.filter(p => p.life > 0);
      drawDeadScreen();
      animId = requestAnimationFrame(loop);
      return;
    }

    // ── RUNNING ──
    frame++;

    // Progressive difficulty
    // Speed ramps up quickly at first then plateaus gracefully
    speed = Math.min(MAX_SPEED, BASE_SPEED + Math.pow(score, 0.55) * 0.18);

    // Physics
    dino.vy        += GRAVITY;
    dino.y         += dino.vy;
    dino.legPhase  += 0.28 * (speed / BASE_SPEED);

    if (dino.y >= groundY - DINO_H) {
      dino.y         = groundY - DINO_H;
      dino.vy        = 0;
      dino.onGround  = true;
    } else {
      dino.onGround  = false;
    }

    // Spawn obstacles — gap shrinks as speed grows
    const baseFreq = 90;
    const minFreq  = 32;
    const freq     = Math.max(minFreq, Math.floor(baseFreq - score * 0.06));
    if (frame % freq === 0) spawnObstacle();

    // Move obstacles
    obstacles.forEach(ob => { ob.x -= speed; });
    obstacles = obstacles.filter(ob => ob.x + ob.w + 4 > 0);

    // Update particles
    particles.forEach(p => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.vy  += 0.1;
      p.life -= 0.06;
    });
    particles = particles.filter(p => p.life > 0);

    // Collision check
    if (obstacles.some(ob => hits(ob))) {
      if (score > hiScore) hiScore = score;
      scoreEl.textContent = `HI ${Math.floor(hiScore).toString().padStart(5, '0')}`;
      phase = 'dead';
      spawnDeathParticles();
      animId = requestAnimationFrame(loop);
      return;
    }

    // Score
    score += 0.12 * (speed / BASE_SPEED);

    // ── Draw ──
    drawGround();
    drawParticles();
    obstacles.forEach(drawCactus);
    drawDino(false);
    drawScore();

    // Speed indicator (subtle)
    const speedPct = (speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED);
    ctx.fillStyle   = cssVar('--cyan');
    ctx.globalAlpha = 0.22;
    ctx.fillRect(W - 3, H - (H * speedPct), 2, H * speedPct);
    ctx.globalAlpha = 1;

    animId = requestAnimationFrame(loop);
  }

  // ── Boot ──
  resize();
  initDino();
  obstacles  = [];
  particles  = [];
  score      = 0;
  frame      = 0;
  phase      = 'start';
  scoreEl.textContent = 'HI 00000';

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    initDino();
    if (phase !== 'running') {
      obstacles = [];
      particles = [];
    }
    loop();
  });

  loop();
})();