// ============ FOOTER YEAR ============
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ============ REDUCED MOTION PREFERENCE ============
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============ THEME TOGGLE ============
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

// ============ VISUAL MOCK RENDERER (shared by work grid + carousel) ============
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
function visualClassFor(type) {
  const map = { bars: 'work-visual--1', components: 'work-visual--2', map: 'work-visual--3', flow: 'work-visual--4' };
  return map[type] || 'work-visual--1';
}

// ============ CASE STUDIES (hardcoded — no JSON file, each has its own static page) ============
const CASE_STUDIES = [
  {
    id: 'customer-care-portal',
    title: 'Customer Care Portal',
    tag: 'Enterprise UX · Manufacturing',
    cardSummary: 'A centralized B2B portal turning email-and-spreadsheet complaint handling into a traceable, role-based 8D resolution workflow.',
    visual: 'flow',
    href: 'customer-care-portal.html'
  },
  // {
  //   id: 'design-system',
  //   title: 'Enterprise Design System',
  //   tag: 'Design Systems',
  //   cardSummary: 'Reusable component library and token set that standardised UI across teams and cut handoff time by 30%.',
  //   visual: 'components',
  //   href: 'design-system.html'
  // },
  // {
  //   id: 'discrepancy-reporting',
  //   title: 'Discrepancy Reporting Suite',
  //   tag: 'Data Visualization',
  //   cardSummary: 'Treemap and bar-chart views built to surface reporting discrepancies at a glance for operations teams.',
  //   visual: 'map',
  //   href: 'discrepancy-reporting.html'
  // },
  // {
  //   id: 'metrics-monitor',
  //   title: 'Metrics Refresh Monitor',
  //   tag: 'Dashboard Design',
  //   cardSummary: 'Status dashboard for pipeline health, designed around a strict information hierarchy for on-call teams.',
  //   visual: 'flow',
  //   href: 'metrics-monitor.html'
  // },
];

// ============ FEATURED WORK GRID WITH PAGINATION (index page) ============
(function initWorkGrid() {
  const grid = document.getElementById('workGrid');
  const paginationEl = document.getElementById('workPagination');
  if (!grid) return;

  const PAGE_SIZE = 4;
  const totalPages = Math.max(1, Math.ceil(CASE_STUDIES.length / PAGE_SIZE));
  let page = 1;

  function cardHtml(cs) {
    return `
      <div class="work-tile tilt" tabindex="0" role="link"
           aria-label="View case study: ${cs.title}"
           data-href="${cs.href}">
        <div class="work-visual ${visualClassFor(cs.visual)}">
          ${renderVisualMock(cs.visual)}
        </div>
        <div class="work-info">
          <h3>${cs.title}</h3>
          <p>${cs.cardSummary}</p>
          <span class="work-tag">${cs.tag}</span>
          <div class="work-actions">
            <a class="work-link magnetic" href="${cs.href}">View case study →</a>
            <button class="copy-btn" data-path="${cs.href}" title="Copy case study link" aria-label="Copy case study link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
              <span class="copy-toast">Link copied</span>
            </button>
          </div>
        </div>
      </div>`;
  }

  function renderPage() {
    const start = (page - 1) * PAGE_SIZE;
    const items = CASE_STUDIES.slice(start, start + PAGE_SIZE);
    grid.innerHTML = items.map(cardHtml).join('');

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
  }

  function renderPagination() {
    if (!paginationEl) return;
    if (totalPages <= 1) { paginationEl.innerHTML = ''; return; }

    let html = `<button class="page-btn" data-page="prev" ${page === 1 ? 'disabled' : ''} aria-label="Previous page">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
    </button>`;

    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="page-btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    html += `<button class="page-btn" data-page="next" ${page === totalPages ? 'disabled' : ''} aria-label="Next page">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
    </button>`;

    paginationEl.innerHTML = html;

    paginationEl.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.page === 'prev') page = Math.max(1, page - 1);
        else if (btn.dataset.page === 'next') page = Math.min(totalPages, page + 1);
        else page = parseInt(btn.dataset.page, 10);
        renderPage();
        renderPagination();
        grid.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' });
      });
    });
  }

  renderPage();
  renderPagination();
})();

// ============ MORE CASE STUDIES CAROUSEL (case study detail pages) ============
(function initMoreCaseStudies() {
  const section = document.getElementById('moreCaseStudies');
  if (!section) return;

  // Get current HTML filename
  const currentPage = window.location.pathname
    .split('/')
    .pop()
    .replace('.html', '');

  // Find current case study
  const currentId = currentPage;

  // Remove current case study from carousel
  const others = CASE_STUDIES.filter(cs => cs.id !== currentId);

  if (!others.length) {
    section.hidden = true;
    return;
  }

  const track = section.querySelector('.more-cs-track');
  const prevBtn = section.querySelector('[data-more-cs="prev"]');
  const nextBtn = section.querySelector('[data-more-cs="next"]');

  if (!track) return;

  track.innerHTML = others.map(cs => `
    <a
      class="work-tile more-cs-card tilt"
      href="${cs.href}"
      aria-label="View case study: ${cs.title}"
    >
      <div class="work-visual ${visualClassFor(cs.visual)}">
        ${renderVisualMock(cs.visual)}
      </div>

      <div class="work-info">
        <h3>${cs.title}</h3>
        <p>${cs.cardSummary}</p>
        <span class="work-tag">${cs.tag}</span>
      </div>
    </a>
  `).join('');

  bindTilt(track);

  if (window.__bindCursorHover) {
    window.__bindCursorHover(track);
  }

  function updateArrows() {
    if (!prevBtn || !nextBtn) return;

    prevBtn.disabled = track.scrollLeft <= 4;

    nextBtn.disabled =
      track.scrollLeft >=
      track.scrollWidth - track.clientWidth - 4;
  }

  function scrollByCard(dir) {
    const card = track.querySelector('.more-cs-card');

    const amount = card
      ? card.getBoundingClientRect().width + 16
      : 240;

    track.scrollBy({
      left: dir * amount,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  }

  prevBtn?.addEventListener('click', () => {
    scrollByCard(-1);
  });

  nextBtn?.addEventListener('click', () => {
    scrollByCard(1);
  });

  track.addEventListener('scroll', updateArrows, {
    passive: true
  });

  window.addEventListener('resize', updateArrows);

  requestAnimationFrame(() => {
    const nav = section.querySelector('.more-cs-nav');

    if (
      nav &&
      track.scrollWidth <= track.clientWidth + 4
    ) {
      nav.hidden = true;
    }

    updateArrows();
  });
})();

// ============ GALLERY LIGHTBOX (view-only screens, no upload) ============
(function initGalleryLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const visualEl = lightbox.querySelector('.lightbox-visual');
  const titleEl = lightbox.querySelector('.lightbox-body h4');
  const descEl = lightbox.querySelector('.lightbox-body p');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  function open(tile) {
    const label = tile.dataset.label || 'Screen';
    const desc = tile.dataset.desc || '';
    const img = tile.dataset.img;

    titleEl.textContent = label;
    descEl.textContent = desc;

    if (img) {
      visualEl.innerHTML = `<img src="${img}" alt="${label}">`;
    } else {
      visualEl.innerHTML = `<div class="placeholder-label">${label} — screen preview coming soon</div>`;
    }

    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.gallery-tile').forEach(tile => {
    tile.addEventListener('click', () => open(tile));
  });

  closeBtn?.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lightbox.hidden) close(); });
})();

// ============ SMOOTH SCROLL WITH OFFSET ============
const OFFSET = 80;

function smoothScrollWithOffset(e) {
  const href = this.getAttribute("href");
  if (!href.startsWith("#")) return;

  e.preventDefault();
  const target = document.querySelector(href);
  if (!target) return;

  const top = target.getBoundingClientRect().top + window.pageYOffset - OFFSET;
  window.scrollTo({ top, behavior: "smooth" });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", smoothScrollWithOffset);
});

// ── Disable right-click context menu ──
document.addEventListener('contextmenu', e => e.preventDefault());

// ============ DINO GAME ============
(function initDinoGame() {
  const canvas  = document.getElementById('dinoCanvas');
  const scoreEl = document.getElementById('dinoScore');
  const jumpBtn = document.getElementById('dinoJumpBtn');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#fff';
  }

  const DINO_W      = 22;
  const DINO_H      = 30;
  const JUMP_V      = -12.5;
  const GRAVITY     = 0.58;
  const BASE_SPEED  = 4.5;
  const MAX_SPEED   = 14;

  let W, H, groundY;
  let dino, obstacles, particles;
  let score, hiScore, speed, frame;
  let phase;
  let animId;
  let startPulse = 0;
  let deathFrame = 0;

  hiScore = 0;

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = Math.round(W * devicePixelRatio);
    canvas.height = Math.round(H * devicePixelRatio);
    ctx.scale(devicePixelRatio, devicePixelRatio);
    groundY = H - 14;
  }

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
      setTimeout(() => resetGame(), 180);
    }
  }

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

  function spawnObstacle() {
    const h = 18 + Math.random() * 24;
    const w = 10 + Math.random() * 8;
    const count = score > 300 && Math.random() < 0.35 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      obstacles.push({
        x: W + i * (w + 8),
        y: groundY - h,
        w, h,
        hue: Math.random() < 0.5 ? 0 : 1,
      });
    }
  }

  function hits(ob) {
    const pad = 5;
    return !(
      dino.x + DINO_W - pad < ob.x      + pad ||
      dino.x             + pad > ob.x + ob.w - pad ||
      dino.y + DINO_H    - pad < ob.y      + pad ||
      dino.y             + pad > ob.y + ob.h - pad
    );
  }

  function drawGround() {
    ctx.strokeStyle = cssVar('--border-strong');
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, groundY + DINO_H + 2);
    ctx.lineTo(W, groundY + DINO_H + 2);
    ctx.stroke();

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

    const shadowAlpha = dino.onGround ? 0.18 : Math.max(0, 0.18 - (groundY - DINO_H - dino.y) / (groundY * 2));
    ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
    ctx.beginPath();
    const shadowW = DINO_W * (dino.onGround ? 1 : 0.7);
    ctx.ellipse(x + DINO_W / 2, groundY + DINO_H + 2, shadowW / 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = ink;

    ctx.beginPath();
    ctx.roundRect(x, y + 8, DINO_W, DINO_H - 8, 4);
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(x + 7, y, 15, 14, 3);
    ctx.fill();

    ctx.fillStyle = dead ? cssVar('--void') : cssVar('--surface');
    ctx.beginPath();
    ctx.roundRect(x + 18, y + 7, 6, 3, 1);
    ctx.fill();

    ctx.fillStyle = eye;
    ctx.beginPath();
    ctx.arc(x + 18, y + 4, dead ? 3 : 2.5, 0, Math.PI * 2);
    ctx.fill();
    if (dead) {
      ctx.strokeStyle = ink;
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + 16, y + 2); ctx.lineTo(x + 20, y + 6);
      ctx.moveTo(x + 20, y + 2); ctx.lineTo(x + 16, y + 6);
      ctx.stroke();
    }

    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(x, y + 14);
    ctx.lineTo(x - 7, y + 18);
    ctx.lineTo(x, y + 22);
    ctx.closePath();
    ctx.fill();

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
    ctx.beginPath();
    ctx.roundRect(ob.x + ob.w * 0.3, ob.y, ob.w * 0.42, ob.h, 3);
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(ob.x, ob.y + ob.h * 0.28, ob.w * 0.36, ob.h * 0.32, 2);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(ob.x, ob.y + ob.h * 0.12, ob.w * 0.14, ob.h * 0.2, 2);
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(ob.x + ob.w * 0.64, ob.y + ob.h * 0.38, ob.w * 0.36, ob.h * 0.28, 2);
    ctx.fill();
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

  function drawStartScreen() {
    startPulse += 0.04;

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

    dino.y = groundY - DINO_H + Math.sin(startPulse * 1.5) * 3;
    drawDino(false);
    drawGround();

    ctx.font      = `700 13px ${cssVar('--font-display') || 'sans-serif'}`;
    ctx.fillStyle = cssVar('--text');
    ctx.textAlign = 'center';
    ctx.fillText('DINO RUN', W / 2, groundY - 24);

    const alpha = 0.5 + Math.sin(startPulse * 3) * 0.5;
    ctx.font      = `500 10px ${cssVar('--font-mono') || 'monospace'}`;
    ctx.fillStyle = cssVar('--cyan');
    ctx.globalAlpha = alpha;
    ctx.fillText(
      window.matchMedia('(hover:none)').matches ? '▲  TAP TO START' : '▲  SPACE / CLICK TO START',
      W / 2, groundY - 10
    );
    ctx.globalAlpha = 1;

    const previewX = W * 0.82 + Math.sin(startPulse * 0.8) * 4;
    drawCactus({ x: previewX, y: groundY - 28, w: 14, h: 28, hue: 0 });
  }

  function drawDeadScreen() {
    deathFrame++;
    const reveal = Math.min(deathFrame / 25, 1);

    drawGround();
    drawParticles();
    drawDino(true);

    ctx.globalAlpha = reveal * 0.65;
    ctx.fillStyle   = cssVar('--void');
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;

    if (reveal > 0.6) {
      const a = (reveal - 0.6) / 0.4;
      const midY = H / 2;

      ctx.font      = `800 13px ${cssVar('--font-display') || 'sans-serif'}`;
      ctx.fillStyle = cssVar('--amber');
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', W / 2, midY - 26);

      ctx.font = `500 10px ${cssVar('--font-mono') || 'monospace'}`;

      ctx.fillStyle = cssVar('--cyan');
      ctx.textAlign = 'left';
      ctx.fillText(`HI  ${Math.floor(hiScore).toString().padStart(5, '0')}`, W / 2 - 65, midY - 4);

      ctx.strokeStyle = cssVar('--border-strong');
      ctx.lineWidth   = 0.8;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(W / 2, midY - 14);
      ctx.lineTo(W / 2, midY + 4);
      ctx.stroke();

      ctx.fillStyle = cssVar('--text-muted');
      ctx.textAlign = 'right';
      ctx.fillText(`SCORE  ${Math.floor(score).toString().padStart(5, '0')}`, W / 2 + 80, midY - 4);

      ctx.textAlign = 'center';

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

  function loop() {
    ctx.clearRect(0, 0, W, H);

    if (phase === 'start') {
      frame++;
      drawStartScreen();
      animId = requestAnimationFrame(loop);
      return;
    }

    if (phase === 'dead' || phase === 'restart') {
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

    frame++;

    speed = Math.min(MAX_SPEED, BASE_SPEED + Math.pow(score, 0.55) * 0.18);

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

    const baseFreq = 90;
    const minFreq  = 32;
    const freq     = Math.max(minFreq, Math.floor(baseFreq - score * 0.06));
    if (frame % freq === 0) spawnObstacle();

    obstacles.forEach(ob => { ob.x -= speed; });
    obstacles = obstacles.filter(ob => ob.x + ob.w + 4 > 0);

    particles.forEach(p => {
      p.x   += p.vx;
      p.y   += p.vy;
      p.vy  += 0.1;
      p.life -= 0.06;
    });
    particles = particles.filter(p => p.life > 0);

    if (obstacles.some(ob => hits(ob))) {
      if (score > hiScore) hiScore = score;
      scoreEl.textContent = `HI ${Math.floor(hiScore).toString().padStart(5, '0')}`;
      phase = 'dead';
      spawnDeathParticles();
      animId = requestAnimationFrame(loop);
      return;
    }

    score += 0.12 * (speed / BASE_SPEED);

    drawGround();
    drawParticles();
    obstacles.forEach(drawCactus);
    drawDino(false);
    drawScore();

    const speedPct = (speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED);
    ctx.fillStyle   = cssVar('--cyan');
    ctx.globalAlpha = 0.22;
    ctx.fillRect(W - 3, H - (H * speedPct), 2, H * speedPct);
    ctx.globalAlpha = 1;

    animId = requestAnimationFrame(loop);
  }

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