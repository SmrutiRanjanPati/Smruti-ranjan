// ============ FOOTER YEAR ============
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ============ REDUCED MOTION PREFERENCE ============
// Used to skip purely decorative, JS-driven motion (the 3D hero scene,
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

// ============ THREE.JS HERO: EXPLODED UI-LAYER STACK ============
// The banner already shows its CSS gradient + grid background immediately,
// so the WebGL scene is purely a decorative enhancement on top of it.
// Two changes here versus before:
//  1. On prefers-reduced-motion, skip it entirely - the static gradient
//     banner is what those users see, matching their motion preference.
//  2. Otherwise, kick it off via requestIdleCallback so it initializes
//     once the browser is done with more important work (parsing,
//     first paint, the counters/reveal observers above) instead of
//     competing with them during the critical load window.
function initHero() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const banner = canvas.parentElement;
  let width = banner.clientWidth, height = banner.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0.4, 7);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);

  const group = new THREE.Group();
  scene.add(group);

  const layerColors = [0x6c5ce7, 0x00e5c7, 0xff8a4c, 0x6c5ce7];
  const panels = [];
  const panelCount = 5;

  for (let i = 0; i < panelCount; i++) {
    const geo = new THREE.PlaneGeometry(2.6, 1.6);
    const mat = new THREE.MeshBasicMaterial({
      color: layerColors[i % layerColors.length],
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);

    const edges = new THREE.EdgesGeometry(geo);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: layerColors[i % layerColors.length], transparent: true, opacity: 0.55 })
    );
    mesh.add(line);

    const compCount = 2 + (i % 3);
    for (let c = 0; c < compCount; c++) {
      const cw = 0.3 + Math.random() * 0.6;
      const ch = 0.12 + Math.random() * 0.18;
      const cgeo = new THREE.PlaneGeometry(cw, ch);
      const cmat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 });
      const cmesh = new THREE.Mesh(cgeo, cmat);
      cmesh.position.set((Math.random() - 0.5) * 1.8, (Math.random() - 0.5) * 1, 0.01);
      mesh.add(cmesh);
    }

    mesh.position.z = (i - (panelCount - 1) / 2) * 0.55;
    mesh.userData.baseZ = mesh.position.z;
    mesh.userData.floatOffset = Math.random() * Math.PI * 2;
    group.add(mesh);
    panels.push(mesh);
  }

  group.rotation.x = -0.15;
  group.rotation.y = 0.35;

  let targetRotX = group.rotation.x;
  let targetRotY = group.rotation.y;
  let explode = 0;

  banner.addEventListener('mousemove', (e) => {
    const r = banner.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    targetRotY = 0.35 + px * 0.6;
    targetRotX = -0.15 - py * 0.4;
  });

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    explode = Math.max(0, Math.min(1, scrollY / 500));
  }, { passive: true });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    group.rotation.x += (targetRotX - group.rotation.x) * 0.04;
    group.rotation.y += (targetRotY - group.rotation.y) * 0.04;
    group.rotation.y += 0.0009;

    panels.forEach((mesh) => {
      const spread = 1 + explode * 1.8;
      mesh.position.z = mesh.userData.baseZ * spread;
      mesh.position.y = Math.sin(t * 0.6 + mesh.userData.floatOffset) * 0.05;
    });

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    width = banner.clientWidth; height = banner.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}

if (!prefersReducedMotion) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initHero, { timeout: 2000 });
  } else {
    setTimeout(initHero, 200);
  }
}

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