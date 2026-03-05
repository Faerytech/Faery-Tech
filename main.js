/* ============================================================
   FAERY TECH — main.js
   Shared across all pages: starfield, sparkle cursor, scroll fade
   ============================================================ */

/* ── STARFIELD ── */
const canvas = document.getElementById('starfield');
const ctx    = canvas.getContext('2d');
let stars    = [];

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initStars(count = 180) {
  stars = Array.from({ length: count }, () => ({
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height,
    r:     Math.random() * 1.4 + 0.3,
    speed: Math.random() * 0.015 + 0.003,
    phase: Math.random() * Math.PI * 2,
    color: Math.random() > 0.85
           ? `hsl(${260 + Math.random() * 40}, 80%, 75%)`
           : Math.random() > 0.93 ? '#00ff88' : '#f0f0ff'
  }));
}

function drawStars(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(s => {
    const alpha = 0.4 + 0.6 * Math.abs(Math.sin(s.phase + t * s.speed));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle   = s.color;
    ctx.globalAlpha = alpha;
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

let frame = 0;
function animate() { drawStars(frame++); requestAnimationFrame(animate); }

resize(); initStars(); animate();
window.addEventListener('resize', () => { resize(); initStars(); });


/* ── SPARKLE CURSOR ── */
const sparkleColors = ['#7b2fff', '#a259ff', '#00ff88', '#c4b5fd', '#ffffff'];

document.addEventListener('mousemove', e => {
  if (Math.random() > 0.35) return;
  const el    = document.createElement('div');
  el.className = 'sparkle';
  const size  = Math.random() * 7 + 3;
  const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
  const glow  = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
  el.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - size/2}px;top:${e.clientY - size/2}px;background:${color};box-shadow:0 0 ${size*2}px ${glow};`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 700);
});


/* ── SCROLL FADE-IN ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity   = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card, .pricing-card').forEach(el => {
  el.style.opacity    = '0';
  el.style.transform  = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});