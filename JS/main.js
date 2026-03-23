/* ============================================================
   FAERY TECH — main.js
   Handles: starfield canvas, sparkle cursor, hamburger menu,
            copyright year
   ============================================================ */

/* ── Hamburger menu ── */
document.addEventListener('DOMContentLoaded', function () {

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var hamburger = document.getElementById('hamburger');
  var navLinks  = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  /* ── Starfield ── */
  var canvas = document.getElementById('starfield');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var stars = [];
  var NUM_STARS = 180;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initStars() {
    stars = [];
    for (var i = 0; i < NUM_STARS; i++) {
      stars.push({
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        r:       Math.random() * 1.4 + 0.3,
        alpha:   Math.random(),
        speed:   Math.random() * 0.004 + 0.001,
        drift:   (Math.random() - 0.5) * 0.08,
      });
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(function (s) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(240,240,255,' + s.alpha.toFixed(2) + ')';
      ctx.fill();

      /* Twinkle */
      s.alpha += s.speed * (Math.random() > 0.5 ? 1 : -1);
      if (s.alpha > 1)   s.alpha = 1;
      if (s.alpha < 0.1) s.alpha = 0.1;

      /* Drift */
      s.x += s.drift;
      if (s.x < 0)              s.x = canvas.width;
      if (s.x > canvas.width)   s.x = 0;
    });
    requestAnimationFrame(drawStars);
  }

  resize();
  initStars();
  drawStars();

  window.addEventListener('resize', function () {
    resize();
    initStars();
  });

});

/* ── Sparkle cursor ── */
document.addEventListener('mousemove', function (e) {
  var colors = ['#7b2fff','#a259ff','#00ff88','#c4b5fd','#f0f0ff'];
  var sparkle = document.createElement('div');
  sparkle.className = 'sparkle';
  var size = Math.random() * 6 + 3;
  sparkle.style.cssText = [
    'left:'   + (e.clientX - size / 2) + 'px',
    'top:'    + (e.clientY - size / 2) + 'px',
    'width:'  + size + 'px',
    'height:' + size + 'px',
    'background:' + colors[Math.floor(Math.random() * colors.length)],
  ].join(';');
  document.body.appendChild(sparkle);
  setTimeout(function () { sparkle.remove(); }, 700);
});

/* ── EMAIL POPUP (homepage only) ── */
(function () {
  var overlay = document.getElementById('emailPopup');
  if (!overlay) return; /* Only runs on pages that have the popup */

  var STORAGE_KEY = 'ft_popup_dismissed';
  var DISMISS_DAYS = 7;

  /* Check if dismissed recently */
  function isDismissed() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    var ts = parseInt(stored, 10);
    return (Date.now() - ts) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  }

  function showPopup() {
    if (isDismissed()) return;
    overlay.classList.add('visible');
  }

  function dismissPopup() {
    overlay.classList.remove('visible');
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }

  /* Trigger: 12 seconds OR 50% scroll */
  var triggered = false;
  function trigger() {
    if (triggered) return;
    triggered = true;
    showPopup();
  }

  var timer = setTimeout(trigger, 12000);

  window.addEventListener('scroll', function () {
    var scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    if (scrolled > 50) trigger();
  }, { passive: true });

  /* Close button */
  var closeBtn = document.getElementById('popupClose');
  if (closeBtn) closeBtn.addEventListener('click', dismissPopup);

  /* Click outside card */
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) dismissPopup();
  });

  /* Skip link */
  var skipLink = document.getElementById('popupSkip');
  if (skipLink) skipLink.addEventListener('click', dismissPopup);

  /* Form submit */
  var form = document.getElementById('popupForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('popupEmail').value.trim();
      if (!email) return;

      /* Send to Formspree quiz lead endpoint */
      fetch('https://formspree.io/f/xwvrregv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: email,
          source: 'homepage_popup',
          _subject: 'New Email Signup — Homepage Popup',
        }),
      }).catch(function () {}); /* Fail silently — don't block UX */

      /* Show success */
      document.getElementById('popupFormWrap').style.display = 'none';
      document.getElementById('popupSuccess').style.display = 'block';

      /* Auto-close after 3.5 seconds */
      setTimeout(dismissPopup, 3500);
    });
  }
})();
