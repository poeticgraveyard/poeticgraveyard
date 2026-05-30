/* ============================================================
   POETIC GRAVEYARD — Production JavaScript
   Dark Academia Literary Archive
   ============================================================ */

// ── 0. SMOOTH SCROLL UTILITY ──
/**
 * Smoothly scrolls to a section by its ID.
 * Uses native smooth scroll (already set in CSS via html { scroll-behavior: smooth })
 * with a JS fallback for browsers that don't support it.
 * @param {string} id - The section ID without the '#'
 */
function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const navHeight = document.getElementById('navbar') ? document.getElementById('navbar').offsetHeight : 70;
  const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

  if ('scrollBehavior' in document.documentElement.style) {
    // Native smooth scroll supported
    window.scrollTo({ top: top, behavior: 'smooth' });
  } else {
    // JS fallback for older browsers
    const start = window.pageYOffset;
    const distance = top - start;
    const duration = 600;
    let startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;
      window.scrollTo(0, start + distance * ease);
      if (elapsed < duration) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
}

// Handle all anchor links that point to #id targets
document.addEventListener('click', function (e) {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const hash = link.getAttribute('href');
  if (!hash || hash === '#') return;
  const id = hash.slice(1);
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  scrollToSection(id);
  // Close mobile menu if open
  closeMobile();
});

// ── 1. SUBMISSIONS DATA STRUCTURE ──
const submissions = [];

function getWorksByCategory(category) {
  return submissions.filter(s => s.category === category && s.status === 'published');
}

function getAllPublishedWorks() {
  return submissions.filter(s => s.status === 'published');
}

function getFeaturedWorks() {
  return submissions.filter(s => s.status === 'published' && s.featured);
}

function getWriters() {
  const writers = {};
  submissions.filter(s => s.status === 'published').forEach(s => {
    if (!writers[s.author]) {
      writers[s.author] = { name: s.author, works: 0 };
    }
    writers[s.author].works++;
  });
  return Object.values(writers);
}

// ── 2. TOAST NOTIFICATIONS ──
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ── 3. NAVIGATION ──
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  });
}

function closeMobile() {
  if (!mobileMenu || !hamburger) return;
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
}

// Close mobile menu when clicking outside
document.addEventListener('click', function (e) {
  if (
    mobileMenu &&
    mobileMenu.classList.contains('open') &&
    !mobileMenu.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    closeMobile();
  }
});

// ── 4. SCROLL SPY — Active nav highlighting ──
(function initScrollSpy() {
  const sections = ['home', 'about', 'categories', 'explore', 'writers', 'community', 'socials', 'submit'];
  const navLinks = document.querySelectorAll('.nav-links a');

  function getActiveSection() {
    const navHeight = navbar ? navbar.offsetHeight : 70;
    const scrollY = window.pageYOffset;
    let active = sections[0];

    for (const id of sections) {
      const el = document.getElementById(id);
      if (!el) continue;
      const top = el.getBoundingClientRect().top + scrollY - navHeight - 10;
      if (scrollY >= top) active = id;
    }
    return active;
  }

  function updateActiveNav() {
    const active = getActiveSection();
    navLinks.forEach(a => {
      const href = a.getAttribute('href');
      const isActive = href === '#' + active;
      a.classList.toggle('active', isActive);
    });
  }

  // Throttle scroll events
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { updateActiveNav(); ticking = false; });
      ticking = true;
    }
  });

  updateActiveNav();
})();

// ── 5. INTERSECTION OBSERVER (reveal animations) ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      observer.unobserve(e.target);
      e.target.querySelectorAll('[data-count]').forEach(el => {
        animateCount(el, parseInt(el.dataset.count));
      });
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

function animateCount(el, target) {
  let current = 0;
  const duration = 1800;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current).toLocaleString();
  }, 16);
}

// ── 5. LITERARY QUOTES ──
const literaryQuotes = [
  { text: "There is no greater agony than bearing an untold story inside you.", attr: "— Maya Angelou" },
  { text: "One must always be careful of books, and what is inside them, for words have the power to change us.", attr: "— Cassandra Clare" },
  { text: "I took a deep breath and listened to the old brag of my heart: I am, I am, I am.", attr: "— Sylvia Plath" },
  { text: "The most important things are the hardest to say, because words diminish them.", attr: "— Stephen King" },
  { text: "Every secret of a writer's soul, every experience of his life, every quality of his mind is written large in his works.", attr: "— Virginia Woolf" },
  { text: "Poetry is not a turning loose of emotion, but an escape from emotion.", attr: "— T.S. Eliot" },
  { text: "I am not afraid of storms, for I am learning how to sail my ship.", attr: "— Louisa May Alcott" },
  { text: "Words are, in my not-so-humble opinion, our most inexhaustible source of magic.", attr: "— J.K. Rowling" },
  { text: "I write to give myself strength. I write to be the characters that I am not.", attr: "— Joss Whedon" },
  { text: "She was a girl who knew how to be happy even when she was sad. And that's important.", attr: "— Marilyn Monroe" },
];

function closeQuote() {
  const popup = document.getElementById('quotePopup');
  if (popup) popup.classList.remove('visible');
}

// ── 6. SEARCH ──
const searchInput = document.getElementById('searchInput');
const searchSugg = document.getElementById('searchSuggestions');

if (searchInput && searchSugg) {
  searchInput.addEventListener('input', function() {
    const val = this.value.toLowerCase().trim();
    if (!val) { searchSugg.classList.remove('visible'); return; }
    const matches = []; // No fake suggestions — ready for real data
    if (!matches.length) { searchSugg.classList.remove('visible'); return; }
    searchSugg.innerHTML = matches.slice(0, 5).map(s =>
      '<div class="suggestion-item" onclick="selectSuggestion(\'' + s.text + '\')"><span class="suggestion-type">' + s.type + '</span><span class="suggestion-text">' + s.text + '</span></div>'
    ).join('');
    searchSugg.classList.add('visible');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar')) searchSugg.classList.remove('visible');
  });
}

function selectSuggestion(text) {
  if (searchInput) searchInput.value = text;
  if (searchSugg) searchSugg.classList.remove('visible');
  showToast('Searching for: ' + text);
}

function setFilter(el, filter) {
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  showToast('Filter: ' + filter.charAt(0).toUpperCase() + filter.slice(1));
}

// ── 7. TAGS ──
const tags = [];
function handleTag(e) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    const val = e.target.value.replace(',', '').trim();
    if (val && !tags.includes(val) && tags.length < 8) {
      tags.push(val);
      renderTags();
    }
    e.target.value = '';
  }
}

function removeTag(tag) {
  const i = tags.indexOf(tag);
  if (i > -1) tags.splice(i, 1);
  renderTags();
}

function renderTags() {
  const container = document.getElementById('tagsContainer');
  if (!container) return;
  container.innerHTML = tags.map(t =>
    '<span class="tag">' + t + ' <button onclick="removeTag(\'' + t + '\')" type="button">×</button></span>'
  ).join('');
}

// ── 8. FORM HANDLING ──
function handlePublish(e) {
  if (e) e.preventDefault();
  const pen = document.getElementById('penName');
  const title = document.getElementById('title');
  const content = document.getElementById('content');
  if (!pen || !title || !content) return;
  if (!pen.value.trim() || !title.value.trim() || !content.value.trim()) {
    showToast('Please fill in all required fields');
    return;
  }
  showToast('✦ Your work has been buried here. Thank you.');
  setTimeout(() => {
    pen.value = '';
    const email = document.getElementById('email');
    if (email) email.value = '';
    title.value = '';
    content.value = '';
    const cat = document.getElementById('category');
    if (cat) cat.value = '';
    tags.length = 0;
    renderTags();
  }, 500);
}

// ── 9. LIKE / SAVE / FOLLOW ──
function toggleLike(btn) {
  btn.classList.toggle('liked');
  const svgPath = btn.querySelector('path');
  const liked = btn.classList.contains('liked');
  if (svgPath) svgPath.setAttribute('fill', liked ? 'currentColor' : 'none');
  showToast(liked ? '♥ Added to your loved works' : 'Removed from loved works');
}

function toggleSave(btn) {
  btn.classList.toggle('liked');
  const svgPath = btn.querySelector('path');
  const saved = btn.classList.contains('liked');
  if (svgPath) svgPath.setAttribute('fill', saved ? 'currentColor' : 'none');
  showToast(saved ? '🔖 Bookmarked' : 'Bookmark removed');
}

function toggleFollow(btn) {
  const isFollowing = btn.classList.contains('following');
  btn.classList.toggle('following');
  btn.textContent = isFollowing ? 'Follow' : 'Following';
  showToast(isFollowing ? 'Unfollowed' : 'Following this writer ✓');
}

// ── 10. COPY EMAIL ──
function copyEmail() {
  navigator.clipboard.writeText('poeticgraveyard@gmail.com').then(() => {
    showToast('Email copied to clipboard ✓');
  }).catch(() => {
    showToast('Failed to copy email');
  });
}

// ── 11. RENDER FUNCTIONS ──
function renderExplorePage() {
  const container = document.getElementById('works-container');
  if (!container) return;
  const works = getAllPublishedWorks();
  if (works.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📜</div><h3>No works have been published yet.</h3><p>The archive is waiting for its first literary offerings. Be the voice that breaks the silence.</p><a href="submit.html" class="btn-primary">Submit Your Work</a></div>';
    return;
  }
}

function renderCategoriesPage() {
  const container = document.getElementById('categories-container');
  if (!container) return;
  const categories = [
    { icon: '📜', name: 'Poetry', slug: 'poetry', desc: 'Verse that bleeds, whispers, and endures long after the poet\'s silence.' },
    { icon: '📖', name: 'Short Stories', slug: 'stories', desc: 'Entire worlds compressed into moments. Fiction that lingers and haunts.' },
    { icon: '💌', name: 'Letters Never Sent', slug: 'letters', desc: 'Words written for eyes that may never read them.' },
    { icon: '🕯', name: 'Confessions', slug: 'confessions', desc: 'Anonymous truths spoken into the void.' },
    { icon: '📚', name: 'Essays & Journals', slug: 'essays', desc: 'Personal meditations on grief, beauty, memory, longing.' },
    { icon: '🌙', name: 'Midnight Thoughts', slug: 'midnight', desc: 'The unedited mind at 3am. Raw and brutally honest.' }
  ];
  container.innerHTML = categories.map(cat => {
    const count = getWorksByCategory(cat.slug).length;
    return '<a class="cat-card" href="explore.html?category=' + cat.slug + '"><span class="cat-icon">' + cat.icon + '</span><div class="cat-title">' + cat.name + '</div><div class="cat-desc">' + cat.desc + '</div><div class="cat-count">' + (count > 0 ? count + ' works' : 'Awaiting submissions.') + '</div></a>';
  }).join('');
}

function renderWritersPage() {
  const container = document.getElementById('writers-container');
  if (!container) return;
  const writers = getWriters();
  if (writers.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✍</div><h3>Featured writers will appear here once submissions are approved.</h3><p>Every great archive begins with a single voice. Submit your work and become a founding writer.</p><a href="submit.html" class="btn-primary">Start Writing</a></div>';
    return;
  }
}

function renderCommunityPage() {
  const container = document.getElementById('community-container');
  if (!container) return;
  const totalWorks = getAllPublishedWorks().length;
  if (totalWorks === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🕯</div><h3>This archive is waiting for its first voices.</h3><p>A community is not built by numbers — it is built by words, by vulnerability, by the courage to be read. Be the first.</p><a href="submit.html" class="btn-primary">Share Your Words</a></div>';
    return;
  }
}

// ── 12. HERO CANVAS ANIMATIONS ──
function initHeroAnimations() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const fogCanvas = document.getElementById('fog-canvas');
  const fogCtx = fogCanvas ? fogCanvas.getContext('2d') : null;

  const isMobile = window.innerWidth < 769;
  let W, H;
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;
  let time = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    if (fogCanvas) {
      fogCanvas.width = window.innerWidth;
      fogCanvas.height = Math.round(window.innerHeight * 0.35);
    }
  }
  resize();
  window.addEventListener('resize', () => { resize(); initObjects(); });

  document.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / W - 0.5) * 2;
    targetMouseY = (e.clientY / H - 0.5) * 2;
  });

  // Dust Particles
  class DustParticle {
    constructor(initial) { this.reset(initial); }
    reset(initial) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + 5;
      this.r = Math.random() * 1.6 + 0.3;
      this.vy = -(Math.random() * 0.35 + 0.08);
      this.vx = (Math.random() - 0.5) * 0.18;
      this.alpha = Math.random() * 0.36 + 0.06;
      this.fadeRate = Math.random() * 0.0006 + 0.00015;
      this.hue = Math.random() > 0.65 ? '#8B1E3F' : (Math.random() > 0.5 ? '#ddd8d3' : '#D4B07A');
    }
    update() {
      this.y += this.vy; this.x += this.vx;
      this.alpha -= this.fadeRate;
      if (this.alpha <= 0 || this.y < -5) this.reset();
    }
    draw(c) {
      c.save(); c.globalAlpha = this.alpha;
      c.fillStyle = this.hue;
      c.beginPath(); c.arc(this.x, this.y, this.r, 0, Math.PI * 2); c.fill();
      c.restore();
    }
  }

  // Floating Objects
  class FloatingObject {
    constructor(type, initial) {
      this.type = type; this.hovered = false; this.glowAlpha = 0;
      this.reset(initial);
    }
    reset(initial) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H * 0.85 : H + 80;
      this.scale = Math.random() * 0.5 + 0.5;
      this.vy = -(Math.random() * 0.28 + 0.06);
      this.vx = (Math.random() - 0.5) * 0.15;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.004;
      this.alpha = Math.random() * 0.25 + 0.07;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.012 + 0.004;
      this.wobbleAmp = Math.random() * 0.4 + 0.1;
      this.parallaxDepth = Math.random() * 0.025 + 0.005;
    }
    update() {
      this.y += this.vy;
      this.x += this.vx + Math.sin(this.wobble) * this.wobbleAmp * 0.08;
      this.wobble += this.wobbleSpeed;
      this.rotation += this.rotSpeed;
      this.x += (targetMouseX * this.parallaxDepth * W * 0.15);
      this.y += (targetMouseY * this.parallaxDepth * H * 0.08);
      const dx = mouseX - this.x, dy = mouseY - this.y;
      this.hovered = Math.sqrt(dx * dx + dy * dy) < 60 * this.scale;
      this.glowAlpha += this.hovered ? 0.05 : -0.03;
      this.glowAlpha = Math.max(0, Math.min(0.35, this.glowAlpha));
      if (this.y < -100 || this.x < -150 || this.x > W + 150) this.reset();
    }
    drawGlow(c) {
      const totalAlpha = Math.max(0.1, this.glowAlpha);
      c.save(); c.globalAlpha = totalAlpha;
      const grad = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, 70 * this.scale);
      grad.addColorStop(0, 'rgba(210, 170, 100, 0.5)');
      grad.addColorStop(0.4, 'rgba(160, 100, 60, 0.18)');
      grad.addColorStop(1, 'rgba(139, 30, 63, 0)');
      c.fillStyle = grad;
      c.beginPath(); c.arc(this.x, this.y, 70 * this.scale, 0, Math.PI * 2); c.fill();
      c.restore();
    }
  }

  function drawBook(c, obj) {
    c.save(); c.translate(obj.x, obj.y); c.rotate(obj.rotation); c.scale(obj.scale, obj.scale); c.globalAlpha = obj.alpha;
    const w = 36, h = 46, spine = 8;
    c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(-w/2+3, -h/2+3, w+spine, h);
    c.fillStyle = '#3d1a10'; c.fillRect(-w/2, -h/2, w, h);
    c.fillStyle = '#2a100a'; c.fillRect(-w/2-spine, -h/2, spine, h);
    c.strokeStyle = 'rgba(184,150,90,0.5)'; c.lineWidth = 1;
    c.strokeRect(-w/2+3, -h/2+4, w-6, h-8);
    c.strokeRect(-w/2+6, -h/2+8, w-12, h-16);
    c.fillStyle = '#e8e0d8'; c.fillRect(w/2-3, -h/2+1, 3, h-2);
    c.restore();
  }

  function drawJournal(c, obj) {
    c.save(); c.translate(obj.x, obj.y); c.rotate(obj.rotation); c.scale(obj.scale, obj.scale); c.globalAlpha = obj.alpha;
    const flutter = Math.sin(obj.wobble * 2.5) * 6;
    const w = 44, h = 34;
    c.fillStyle = '#e0d8cc'; c.beginPath();
    c.moveTo(-w, -h/2); c.lineTo(0, -h/2+flutter); c.lineTo(0, h/2+flutter*0.3); c.lineTo(-w, h/2); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(100,80,60,0.2)'; c.lineWidth = 0.8;
    for (let i = -12; i <= 12; i += 6) { c.beginPath(); c.moveTo(-w+4, i); c.lineTo(-4, i+flutter*0.5); c.stroke(); }
    c.fillStyle = '#d8d0c4'; c.beginPath();
    c.moveTo(0, -h/2+flutter); c.lineTo(w, -h/2); c.lineTo(w, h/2); c.lineTo(0, h/2+flutter*0.3); c.closePath(); c.fill();
    c.fillStyle = '#8a6a40'; c.fillRect(-3, -h/2, 6, h+Math.abs(flutter));
    c.restore();
  }

  function drawPen(c, obj) {
    c.save(); c.translate(obj.x, obj.y); c.rotate(obj.rotation+Math.PI/5); c.scale(obj.scale, obj.scale); c.globalAlpha = obj.alpha;
    const len = 60;
    const grad = c.createLinearGradient(-len/2, 0, len/2, 0);
    grad.addColorStop(0, '#1a1614'); grad.addColorStop(0.5, '#3d3532'); grad.addColorStop(1, '#1a1614');
    c.fillStyle = grad; c.beginPath(); c.ellipse(-len/2+len*0.6, 0, len*0.6, 5, 0, 0, Math.PI*2); c.fill();
    c.fillStyle = '#b8965a'; c.fillRect(-4, -5, 8, 10);
    c.fillStyle = '#0a0806'; c.beginPath(); c.ellipse(len*0.35, 0, len*0.22, 4.5, 0, 0, Math.PI*2); c.fill();
    c.fillStyle = '#c8c2bf'; c.beginPath(); c.moveTo(-len/2, -3); c.lineTo(-len/2-12, 0); c.lineTo(-len/2, 3); c.closePath(); c.fill();
    c.fillStyle = 'rgba(107,30,46,0.6)'; c.beginPath(); c.ellipse(-len/2-16, 2, 2, 3, Math.PI/4, 0, Math.PI*2); c.fill();
    c.restore();
  }

  function drawLetter(c, obj) {
    c.save(); c.translate(obj.x, obj.y); c.rotate(obj.rotation); c.scale(obj.scale, obj.scale); c.globalAlpha = obj.alpha;
    const w = 42, h = 32;
    c.fillStyle = '#c8b89a'; c.fillRect(-w/2, -h/2, w, h);
    c.fillStyle = '#b0a080'; c.beginPath(); c.moveTo(-w/2, -h/2); c.lineTo(0, 2); c.lineTo(w/2, -h/2); c.closePath(); c.fill();
    c.fillStyle = '#a09070';
    c.beginPath(); c.moveTo(-w/2, -h/2); c.lineTo(-w/2, h/2); c.lineTo(0, 4); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(w/2, -h/2); c.lineTo(w/2, h/2); c.lineTo(0, 4); c.closePath(); c.fill();
    c.fillStyle = '#8b1a2a'; c.beginPath(); c.arc(0, 4, 8, 0, Math.PI*2); c.fill();
    c.fillStyle = '#a03040'; c.beginPath(); c.arc(0, 4, 5, 0, Math.PI*2); c.fill();
    c.fillStyle = 'rgba(255,220,180,0.6)'; c.font = 'bold 7px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('P', 0, 4);
    c.restore();
  }

  function drawInkBottle(c, obj) {
    c.save(); c.translate(obj.x, obj.y); c.rotate(obj.rotation); c.scale(obj.scale, obj.scale); c.globalAlpha = obj.alpha;
    c.fillStyle = '#0d1a1a'; c.beginPath();
    c.moveTo(-12, 10); c.lineTo(-14, -8); c.lineTo(-6, -14); c.lineTo(6, -14); c.lineTo(14, -8); c.lineTo(12, 10); c.closePath(); c.fill();
    c.fillRect(-5, -22, 10, 10);
    c.fillStyle = '#4a3020'; c.fillRect(-6, -28, 12, 8); c.beginPath(); c.arc(0, -28, 6, Math.PI, 0); c.fill();
    c.fillStyle = 'rgba(20,40,40,0.8)'; c.beginPath();
    c.moveTo(-11, 6); c.lineTo(-12, -4); c.lineTo(-5, -10); c.lineTo(5, -10); c.lineTo(12, -4); c.lineTo(11, 6); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(100,140,130,0.3)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-10, -4); c.lineTo(-8, 4); c.stroke();
    c.fillStyle = 'rgba(220,200,170,0.3)'; c.fillRect(-8, -5, 16, 10);
    c.restore();
  }

  function drawQuill(c, obj) {
    c.save(); c.translate(obj.x, obj.y); c.rotate(obj.rotation+Math.PI/6); c.scale(obj.scale, obj.scale); c.globalAlpha = obj.alpha;
    const flutter = Math.sin(obj.wobble * 3) * 3;
    c.strokeStyle = '#d4c8a8'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 38); c.lineTo(0, -38); c.stroke();
    c.fillStyle = 'rgba(212,200,168,0.7)'; c.beginPath(); c.moveTo(0, -38);
    c.bezierCurveTo(-20+flutter, -10, -24+flutter*0.5, 20, 0, 38); c.closePath(); c.fill();
    c.fillStyle = 'rgba(200,190,155,0.65)'; c.beginPath(); c.moveTo(0, -38);
    c.bezierCurveTo(18-flutter, -12, 22-flutter*0.5, 18, 0, 38); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(150,130,90,0.25)'; c.lineWidth = 0.5;
    for (let i = -28; i < 28; i += 5) {
      c.beginPath(); c.moveTo(0, i); c.lineTo(-14+flutter*(i/40), i+2); c.stroke();
      c.beginPath(); c.moveTo(0, i); c.lineTo(12-flutter*(i/40), i+2); c.stroke();
    }
    c.strokeStyle = '#1a0a04'; c.lineWidth = 2; c.beginPath(); c.moveTo(-3, 38); c.lineTo(0, 50); c.lineTo(3, 38); c.stroke();
    c.restore();
  }

  function drawPage(c, obj) {
    c.save(); c.translate(obj.x, obj.y); c.rotate(obj.rotation); c.scale(obj.scale, obj.scale); c.globalAlpha = obj.alpha;
    const flutter = Math.sin(obj.wobble * 2) * 4;
    c.fillStyle = '#ddd4c0'; c.beginPath();
    c.moveTo(-22, -32); c.lineTo(20, -32+flutter*0.3); c.lineTo(22+flutter*0.5, 28); c.lineTo(-20, 32); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(150,120,80,0.4)'; c.lineWidth = 0.8; c.beginPath();
    for (let i = -22; i < 20; i += 5) { c.moveTo(i, -32+flutter*0.3); c.lineTo(i+2, -32+flutter*0.3-(Math.random()*4+1)); }
    c.stroke();
    c.strokeStyle = 'rgba(80,60,40,0.15)'; c.lineWidth = 0.7;
    for (let i = -20; i <= 18; i += 7) {
      const wl = Math.sin(obj.wobble+i*0.1)*1.2;
      c.beginPath(); c.moveTo(-17, i+wl); c.lineTo(16, i+wl+flutter*0.1); c.stroke();
    }
    c.restore();
  }

  function drawRose(c, obj) {
    c.save(); c.translate(obj.x, obj.y); c.rotate(obj.rotation); c.scale(obj.scale*0.8, obj.scale*0.8); c.globalAlpha = obj.alpha;
    const pc = ['#6b1e2e','#7d2535','#8b2d42','#4a1320'];
    for (let i = 0; i < 5; i++) { c.save(); c.rotate((i/5)*Math.PI*2); c.fillStyle = pc[i%4]; c.globalAlpha = obj.alpha*0.8; c.beginPath(); c.ellipse(0, -12, 7, 12, 0, 0, Math.PI*2); c.fill(); c.restore(); }
    for (let i = 0; i < 4; i++) { c.save(); c.rotate((i/4)*Math.PI*2+0.4); c.fillStyle = '#a03348'; c.globalAlpha = obj.alpha*0.9; c.beginPath(); c.ellipse(0, -8, 5, 8, 0, 0, Math.PI*2); c.fill(); c.restore(); }
    c.fillStyle = '#4a1320'; c.globalAlpha = obj.alpha; c.beginPath(); c.arc(0, 0, 4, 0, Math.PI*2); c.fill();
    c.strokeStyle = '#2a4a20'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 24); c.stroke();
    c.restore();
  }

  class FallingPetal {
    constructor(initial) { this.reset(initial); }
    reset(initial) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H * 0.6 : -20;
      this.vy = Math.random() * 0.6 + 0.2;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.04;
      this.wobble = Math.random() * Math.PI * 2;
      this.alpha = Math.random() * 0.38 + 0.07;
      this.scale = Math.random() * 0.5 + 0.3;
    }
    update() { this.y += this.vy; this.x += this.vx + Math.sin(this.wobble)*0.3; this.wobble += 0.02; this.rotation += this.rotSpeed; if (this.y > H+20) this.reset(); }
    draw(c) { c.save(); c.translate(this.x, this.y); c.rotate(this.rotation); c.scale(this.scale, this.scale); c.globalAlpha = this.alpha; c.fillStyle = '#8b2d42'; c.beginPath(); c.ellipse(0, 0, 6, 10, 0, 0, Math.PI*2); c.fill(); c.restore(); }
  }

  function drawGravestone(c, x, y, scale, alpha) {
    c.save(); c.translate(x, y); c.scale(scale, scale); c.globalAlpha = alpha;
    const w = 30, h = 44;
    c.fillStyle = '#1e1a18'; c.beginPath();
    c.moveTo(-w/2, h/2); c.lineTo(-w/2, -h/2+10); c.arc(0, -h/2+10, w/2, Math.PI, 0); c.lineTo(w/2, h/2); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(100,90,80,0.4)'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(0, -h/2+16); c.lineTo(0, -4); c.stroke();
    c.beginPath(); c.moveTo(-8, -h/2+26); c.lineTo(8, -h/2+26); c.stroke();
    c.fillStyle = '#141210'; c.fillRect(-w/2-5, h/2-4, w+10, 6);
    c.restore();
  }

  function drawCoffin(c) {
    c.save(); c.globalAlpha = 0.05; c.translate(W*0.5, H*0.52);
    const w = Math.min(W*0.22, 200), h = Math.min(H*0.55, 380);
    c.fillStyle = '#1a0c08'; c.beginPath();
    c.moveTo(-w*0.4, -h/2); c.lineTo(w*0.4, -h/2); c.lineTo(w/2, -h*0.25); c.lineTo(w/2, h*0.32);
    c.lineTo(w*0.35, h/2); c.lineTo(-w*0.35, h/2); c.lineTo(-w/2, h*0.32); c.lineTo(-w/2, -h*0.25);
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(139,30,63,0.4)'; c.lineWidth = 1.5; c.beginPath();
    c.moveTo(-w*0.4, -h/2+2); c.lineTo(w*0.4, -h/2+2); c.lineTo(w/2, -h*0.24); c.stroke();
    c.strokeStyle = 'rgba(212,176,122,0.3)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(0, -h*0.15); c.lineTo(0, h*0.2); c.stroke();
    c.beginPath(); c.moveTo(-w*0.2, h*0); c.lineTo(w*0.2, h*0); c.stroke();
    c.restore();
  }

  class Raven {
    constructor() { this.reset(); }
    reset() {
      this.side = Math.random() > 0.5 ? 1 : -1;
      this.x = this.side === 1 ? -100 : W+100;
      this.y = Math.random()*H*0.45+60;
      this.speed = Math.random()*1.8+0.9;
      this.scale = Math.random()*0.6+0.5;
      this.alpha = Math.random()*0.3+0.08;
      this.flapPhase = Math.random()*Math.PI*2;
      this.flapSpeed = Math.random()*0.12+0.08;
      this.waitTimer = Math.random()*600+200;
      this.active = false;
    }
    update() {
      if (!this.active) { this.waitTimer--; if (this.waitTimer <= 0) this.active = true; return; }
      this.x += this.speed*this.side; this.flapPhase += this.flapSpeed;
      if (this.x > W+150 || this.x < -150) this.reset();
    }
    draw(c) {
      if (!this.active) return;
      c.save(); c.translate(this.x, this.y);
      if (this.side === -1) c.scale(-1, 1);
      c.scale(this.scale, this.scale); c.globalAlpha = this.alpha;
      c.fillStyle = '#0d0b0a';
      const wingY = Math.sin(this.flapPhase)*14;
      c.beginPath(); c.ellipse(0, 0, 14, 7, 0, 0, Math.PI*2); c.fill();
      c.beginPath(); c.ellipse(-14, -4, 7, 6, -0.3, 0, Math.PI*2); c.fill();
      c.beginPath(); c.moveTo(-20, -5); c.lineTo(-26, -4); c.lineTo(-20, -3); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(-5, 0); c.bezierCurveTo(-2, wingY-20, 20, wingY-28, 32, wingY-10);
      c.bezierCurveTo(20, wingY+4, 0, 6, -5, 0); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(12, 2); c.lineTo(24, 8); c.lineTo(20, 4); c.closePath(); c.fill();
      c.restore();
    }
  }

  function drawLightRays(c) {
    c.save();
    c.globalAlpha = 0.03 + Math.sin(time*0.008)*0.01;
    const baseAngle = Math.sin(time*0.004)*0.06;
    const cx = W*0.5+mouseX*30, cy = H*0.08+Math.sin(time*0.01)*4;
    for (let i = 0; i < 6; i++) {
      const angle = -0.5+i*0.2+baseAngle, len = H*1.2;
      const grad = c.createLinearGradient(cx, cy, cx+Math.sin(angle)*len, cy+Math.cos(angle)*len);
      grad.addColorStop(0, 'rgba(200,185,140,0.5)'); grad.addColorStop(0.3, 'rgba(180,160,120,0.2)'); grad.addColorStop(1, 'rgba(200,185,140,0)');
      c.fillStyle = grad; c.beginPath();
      c.moveTo(cx-10, cy); c.lineTo(cx+10, cy);
      c.lineTo(cx+Math.sin(angle)*len+80, cy+Math.cos(angle)*len);
      c.lineTo(cx+Math.sin(angle)*len-80, cy+Math.cos(angle)*len);
      c.closePath(); c.fill();
    }
    c.restore();
  }

  class FireflyParticle {
    constructor(initial) { this.reset(initial); }
    reset(initial) {
      this.x = Math.random()*W;
      this.y = initial ? Math.random()*H*0.5+H*0.45 : H*0.95+Math.random()*20;
      this.r = Math.random()*5+3; this.baseR = this.r;
      this.vy = -(Math.random()*0.15+0.04); this.vx = (Math.random()-0.5)*0.08;
      this.alpha = Math.random()*0.22+0.06;
      this.pulseSpeed = Math.random()*0.03+0.015;
      this.pulsePhase = Math.random()*Math.PI*2;
      this.hue = Math.random() > 0.5 ? '#E6D3A3' : '#D4778A';
    }
    update() {
      this.y += this.vy; this.x += this.vx+Math.sin(this.pulsePhase*2)*0.04;
      this.pulsePhase += this.pulseSpeed;
      this.alpha = Math.max(0.03, (0.22+Math.sin(this.pulsePhase)*0.1)*(this.baseR/5));
      this.r = this.baseR*(0.8+Math.sin(this.pulsePhase)*0.2);
      if (this.y < H*0.5 || this.x < -20 || this.x > W+20) this.reset();
    }
    draw(c) {
      c.save(); c.globalAlpha = this.alpha;
      const grad = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r*1.5);
      grad.addColorStop(0, this.hue); grad.addColorStop(0.3, this.hue); grad.addColorStop(1, 'rgba(139,30,63,0)');
      c.fillStyle = grad; c.beginPath(); c.arc(this.x, this.y, this.r*1.5, 0, Math.PI*2); c.fill();
      c.globalAlpha = this.alpha*0.5; c.fillStyle = '#fff8e0';
      c.beginPath(); c.arc(this.x, this.y, this.r*0.3, 0, Math.PI*2); c.fill();
      c.restore();
    }
  }

  class ShootingStar {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random()*W*1.2-W*0.1; this.y = Math.random()*H*0.3+20;
      this.vx = -(Math.random()*4+2); this.vy = Math.random()*1+0.3;
      this.alpha = Math.random()*0.25+0.1;
      this.waitTimer = Math.random()*1200+400; this.active = false; this.trail = [];
    }
    update() {
      if (!this.active) { this.waitTimer--; if (this.waitTimer <= 0) this.active = true; return; }
      this.trail.push({x: this.x, y: this.y}); if (this.trail.length > 12) this.trail.shift();
      this.x += this.vx; this.y += this.vy; this.alpha -= 0.003;
      if (this.alpha <= 0 || this.x < -100 || this.y > H*0.6) this.reset();
    }
    draw(c) {
      if (!this.active || this.alpha <= 0) return;
      c.save(); c.globalAlpha = this.alpha;
      for (let i = 1; i < this.trail.length; i++) {
        const t = i/this.trail.length;
        c.strokeStyle = 'rgba(220,210,190,'+t*this.alpha*0.5+')'; c.lineWidth = t*1.5+0.5;
        c.beginPath(); c.moveTo(this.trail[i-1].x, this.trail[i-1].y); c.lineTo(this.trail[i].x, this.trail[i].y); c.stroke();
      }
      const grad = c.createRadialGradient(this.x, this.y, 0, this.x, this.y, 10);
      grad.addColorStop(0, 'rgba(255,250,230,0.8)'); grad.addColorStop(0.5, 'rgba(220,210,190,0.3)'); grad.addColorStop(1, 'rgba(220,210,190,0)');
      c.fillStyle = grad; c.beginPath(); c.arc(this.x, this.y, 10, 0, Math.PI*2); c.fill();
      c.restore();
    }
  }

  function drawThornyVine(c, x, y, side) {
    c.save(); c.translate(x, y);
    c.globalAlpha = 0.07+Math.sin(time*0.005+(side==='left'?0:Math.PI))*0.01;
    c.strokeStyle = '#2a1a10'; c.lineWidth = 2.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, 0);
    const cpx = side==='left' ? 40+Math.sin(time*0.01)*10 : -40-Math.sin(time*0.01)*10;
    c.quadraticCurveTo(cpx*0.5, -H*0.15, 0, -H*0.25); c.stroke();
    c.lineWidth = 1.5; c.strokeStyle = '#3a2a18';
    for (let i = 0; i < 5; i++) {
      const ty = -H*0.04*(i+1);
      const tx = side==='left' ? 8+Math.sin(time*0.008+i)*3 : -8-Math.sin(time*0.008+i)*3;
      c.beginPath(); c.moveTo(tx*0.3, ty); c.lineTo(tx*1.5, ty-5); c.lineTo(tx*0.5, ty+2); c.stroke();
      c.beginPath(); c.moveTo(tx*0.3, ty); c.lineTo(tx*1.3, ty+6); c.lineTo(tx*0.5, ty+2); c.stroke();
    }
    c.restore();
  }

  // Fog
  const fogClouds = Array.from({length: 8}, (_, i) => ({
    x: (i/8)*(fogCanvas ? fogCanvas.width : W),
    y: Math.random()*(fogCanvas ? fogCanvas.height : H*0.35)*0.7,
    r: Math.random()*120+80, alpha: Math.random()*0.08+0.03,
    vx: (Math.random()-0.5)*0.18, vy: (Math.random()-0.5)*0.06,
  }));

  const burgundyFogClouds = Array.from({length: 6}, (_, i) => ({
    x: (i/6)*(fogCanvas ? fogCanvas.width : W)+Math.random()*50,
    y: Math.random()*(fogCanvas ? fogCanvas.height : H*0.35)*0.5,
    r: Math.random()*160+110, alpha: Math.random()*0.07+0.03,
    vx: (Math.random()-0.5)*0.12, vy: (Math.random()-0.5)*0.04,
  }));

  function drawFog() {
    if (!fogCtx || !fogCanvas) return;
    fogCtx.clearRect(0, 0, fogCanvas.width, fogCanvas.height);
    burgundyFogClouds.forEach(cloud => {
      cloud.x += cloud.vx; cloud.y += cloud.vy;
      if (cloud.x > fogCanvas.width+cloud.r) cloud.x = -cloud.r;
      if (cloud.x < -cloud.r) cloud.x = fogCanvas.width+cloud.r;
      cloud.y = Math.max(cloud.r*0.3, Math.min(fogCanvas.height-cloud.r*0.3, cloud.y));
      const grad = fogCtx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.r);
      grad.addColorStop(0, 'rgba(139,30,63,'+cloud.alpha+')'); grad.addColorStop(1, 'rgba(139,30,63,0)');
      fogCtx.fillStyle = grad; fogCtx.beginPath(); fogCtx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI*2); fogCtx.fill();
    });
    fogClouds.forEach(cloud => {
      cloud.x += cloud.vx; cloud.y += cloud.vy;
      if (cloud.x > fogCanvas.width+cloud.r) cloud.x = -cloud.r;
      if (cloud.x < -cloud.r) cloud.x = fogCanvas.width+cloud.r;
      cloud.y = Math.max(cloud.r*0.3, Math.min(fogCanvas.height-cloud.r*0.3, cloud.y));
      const grad = fogCtx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.r);
      grad.addColorStop(0, 'rgba(180,170,160,'+cloud.alpha+')');
      grad.addColorStop(0.6, 'rgba(140,130,120,'+cloud.alpha*0.5+')');
      grad.addColorStop(1, 'rgba(100,90,80,0)');
      fogCtx.fillStyle = grad; fogCtx.beginPath(); fogCtx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI*2); fogCtx.fill();
    });
    const fogGrad = fogCtx.createLinearGradient(0, fogCanvas.height*0.3, 0, fogCanvas.height);
    fogGrad.addColorStop(0, 'rgba(15,10,8,0)');
    fogGrad.addColorStop(0.6, 'rgba(139,30,63,0.07)');
    fogGrad.addColorStop(0.7, 'rgba(15,10,8,0.12)');
    fogGrad.addColorStop(1, 'rgba(10,8,6,0.35)');
    fogCtx.fillStyle = fogGrad; fogCtx.fillRect(0, 0, fogCanvas.width, fogCanvas.height);
  }

  // Object Pool
  const objectTypes = isMobile
    ? ['book', 'letter', 'quill']
    : ['book', 'book', 'journal', 'pen', 'letter', 'ink', 'quill', 'page', 'rose'];

  let floatingObjects = [], dustParticles = [], fallingPetals = [], ravens = [], fireflies = [], shootingStars = [];

  function initObjects() {
    W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight;
    if (fogCanvas) { fogCanvas.width = W; fogCanvas.height = Math.round(H*0.35); }
    const objCount = isMobile ? 8 : 18;
    floatingObjects = objectTypes.flatMap(t =>
      Array.from({length: Math.ceil(objCount/objectTypes.length)}, () => new FloatingObject(t, true))
    ).slice(0, objCount);
    dustParticles = Array.from({length: isMobile ? 30 : 80}, () => new DustParticle(true));
    fallingPetals = isMobile ? [] : Array.from({length: 12}, () => new FallingPetal(true));
    ravens = isMobile ? [] : [new Raven(), new Raven(), new Raven()];
    fireflies = isMobile ? [] : Array.from({length: 12}, () => new FireflyParticle(true));
    shootingStars = isMobile ? [] : [new ShootingStar(), new ShootingStar()];
  }

  function drawObject(c, obj) {
    obj.drawGlow(c);
    switch (obj.type) {
      case 'book': drawBook(c, obj); break;
      case 'journal': drawJournal(c, obj); break;
      case 'pen': drawPen(c, obj); break;
      case 'letter': drawLetter(c, obj); break;
      case 'ink': drawInkBottle(c, obj); break;
      case 'quill': drawQuill(c, obj); break;
      case 'page': drawPage(c, obj); break;
      case 'rose': drawRose(c, obj); break;
    }
  }

  function animate() {
    time++;
    mouseX += (targetMouseX-mouseX)*0.06;
    mouseY += (targetMouseY-mouseY)*0.06;
    ctx.clearRect(0, 0, W, H);
    drawLightRays(ctx);
    drawCoffin(ctx);
    if (!isMobile) {
      [{x:W*0.08,s:0.9,a:0.06},{x:W*0.18,s:1.2,a:0.07},{x:W*0.78,s:1.0,a:0.05},{x:W*0.88,s:0.85,a:0.07},{x:W*0.93,s:1.1,a:0.055}]
        .forEach(g => drawGravestone(ctx, g.x, H-60+Math.sin(time*0.003+g.x)*2, g.s, g.a));
    }
    floatingObjects.forEach(obj => { obj.update(); drawObject(ctx, obj); });
    dustParticles.forEach(p => { p.update(); p.draw(ctx); });
    fallingPetals.forEach(p => { p.update(); p.draw(ctx); });
    fireflies.forEach(p => { p.update(); p.draw(ctx); });
    shootingStars.forEach(s => { s.update(); s.draw(ctx); });
    ravens.forEach(r => { r.update(); r.draw(ctx); });
    if (!isMobile) { drawThornyVine(ctx, 0, H-60, 'left'); drawThornyVine(ctx, W, H-60, 'right'); }
    drawFog();
    requestAnimationFrame(animate);
  }

  // Canvas click for quotes
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX-rect.left, cy = e.clientY-rect.top;
    const hit = floatingObjects.find(obj => {
      if (obj.type !== 'book' && obj.type !== 'journal') return false;
      return Math.sqrt((cx-obj.x)**2+(cy-obj.y)**2) < 35*obj.scale;
    });
    if (hit) {
      const q = literaryQuotes[Math.floor(Math.random()*literaryQuotes.length)];
      const txt = document.getElementById('quoteText');
      const attr = document.getElementById('quoteAttr');
      const popup = document.getElementById('quotePopup');
      if (txt) txt.textContent = q.text;
      if (attr) attr.textContent = q.attr;
      if (popup) popup.classList.add('visible');
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX-rect.left, cy = e.clientY-rect.top;
    const hitObj = floatingObjects.find(obj => Math.sqrt((cx-obj.x)**2+(cy-obj.y)**2) < 40*obj.scale);
    canvas.style.cursor = hitObj ? 'pointer' : 'default';
  });

  initObjects();
  animate();
}

// ── 13. INITIALIZATION ──
document.addEventListener('DOMContentLoaded', () => {
  renderExplorePage();
  renderCategoriesPage();
  renderWritersPage();
  renderCommunityPage();
  if (document.getElementById('particle-canvas')) {
    initHeroAnimations();
  }
});