/* ============================================================
   FAERY TECH — main.js
   Shared across all pages
   ============================================================ */

/* ── Starfield ─────────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < 160; i++) {
      stars.push({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     Math.random() * 1.2 + 0.2,
        alpha: Math.random(),
        speed: Math.random() * 0.004 + 0.001,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = Date.now() / 1000;
    stars.forEach(s => {
      const a = 0.3 + 0.5 * Math.abs(Math.sin(s.phase + t * s.speed * 10));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 200, 255, ${a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  initStars();
  draw();
  window.addEventListener('resize', () => { resize(); initStars(); });
})();

/* ── Sparkle cursor ─────────────────────────────────────────── */
(function () {
  document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.3) return;
    const dot = document.createElement('div');
    dot.className = 'sparkle';
    const size = Math.random() * 5 + 2;
    dot.style.cssText = `
      left: ${e.clientX - size / 2}px;
      top:  ${e.clientY - size / 2}px;
      width:  ${size}px;
      height: ${size}px;
      background: ${Math.random() > 0.5 ? '#00ff88' : '#a259ff'};
    `;
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 700);
  });
})();

/* ── Active nav link ────────────────────────────────────────── */
(function () {
  const links = document.querySelectorAll('.nav-links a');
  const current = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    if (link.getAttribute('href') === current) link.classList.add('active');
  });
})();

/* ── Hamburger menu ─────────────────────────────────────────── */
(function () {
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (!hamburger || !navLinks) return;

  /* Toggle open/close */
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  /* Close when a link is clicked */
  navLinks.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });

  /* Close when clicking outside */
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    }
  });
})();