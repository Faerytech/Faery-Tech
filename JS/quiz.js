/* ============================================================
   quiz.js — "What's Your Magical Archetype?"
   6 archetypes, 10 questions, coupons, share, commission pre-fill
   ============================================================ */

const Quiz = (function () {

  const TOTAL = 10;
  let currentScreen = 0;
  const answers = {};
  let resultKey = null;

  /* ── 6 Archetypes ── */
  const RESULTS = {
    angel: {
      emoji: '👼',
      name: 'The Angel',
      coupon: { code: 'ANGEL15', amount: 15, display: '$15 off your site' },
      desc: "You show up. Quietly, consistently, without being asked. You remember what matters to people and you act on it. The world works better when you're in it and most people haven't even stopped to notice how much you do.",
      pitch: "Your site should feel like being welcomed home — warm, trustworthy, and genuinely good.",
      nameGrad: 'linear-gradient(135deg,#90caf9,#e3f2fd)',
      bgClass: 'result-bg-angel',
    },
    fairy: {
      emoji: '🧚',
      name: 'The Fairy',
      coupon: { code: 'FAIRY10', amount: 10, display: '$10 off your site' },
      desc: "There is something genuinely enchanting about you that has nothing to do with trying. You find wonder in the ordinary. You bring lightness into heavy rooms. People feel better after talking to you and they're not quite sure why.",
      pitch: "Your site should feel like stumbling onto something magical — delightful, clever, and impossible to forget.",
      nameGrad: 'linear-gradient(135deg,#f48fb1,#ffd54f)',
      bgClass: 'result-bg-fairy',
    },
    dragon: {
      emoji: '🐉',
      name: 'The Dragon',
      coupon: { code: 'DRAGON5', amount: 5, display: '$5 off your site' },
      desc: "Fierce, loyal, and impossible to ignore. You don't do anything halfway. People underestimate you exactly once. You protect what you love with everything you have and you expect the same in return.",
      pitch: "Your site should have power and presence — the kind that makes people sit up and pay attention.",
      nameGrad: 'linear-gradient(135deg,#ff6b35,#ffd166)',
      bgClass: 'result-bg-dragon',
    },
    griffin: {
      emoji: '🦁',
      name: 'The Griffin',
      coupon: { code: 'GRIFFIN5', amount: 5, display: '$5 off your site' },
      desc: "Noble, principled, half-wild. You have standards and you hold them quietly without making a big deal of it. You're equally at home in a boardroom and the wilderness. People trust you instinctively and they're right to.",
      pitch: "Your site should feel authoritative and alive — polished but never cold, structured but never stiff.",
      nameGrad: 'linear-gradient(135deg,#ffd54f,#ff8f00)',
      bgClass: 'result-bg-griffin',
    },
    mermaid: {
      emoji: '🧜',
      name: 'The Mermaid',
      coupon: { code: 'MERMAID5', amount: 5, display: '$5 off your site' },
      desc: "Deep, magnetic, layered. You pull people toward you without trying and they find themselves coming back without knowing why. There's more to you than most people get to see and you're completely fine with that.",
      pitch: "Your site should have depth and draw — the kind that makes people explore slowly and stay longer than they planned.",
      nameGrad: 'linear-gradient(135deg,#4dd0e1,#1565c0)',
      bgClass: 'result-bg-mermaid',
    },
    wizard: {
      emoji: '🧙',
      name: 'The Wizard',
      coupon: { code: 'WIZARD10', amount: 10, display: '$10 off your site' },
      desc: "Wise, methodical, and quietly formidable. You've seen enough to know what matters and you don't waste time on what doesn't. People come to you with their hardest problems and you usually already knew they were coming.",
      pitch: "Your site should feel knowledgeable and intentional — every element there for a reason, nothing wasted.",
      nameGrad: 'linear-gradient(135deg,#c4b5fd,#818cf8)',
      bgClass: 'result-bg-wizard',
    },
  };

  /* ── Question → type mapping (balanced: each type appears 6-7 times) ──
     Q1  (pic):  angel  / griffin / dragon  / wizard
     Q2  (pic):  fairy  / wizard  / mermaid / angel
     Q3  (txt):  angel  / griffin / dragon  / mermaid
     Q4  (pic):  wizard / fairy   / mermaid / dragon
     Q5  (pic):  griffin/ fairy   / mermaid / wizard
     Q6  (txt):  angel  / griffin / fairy   / mermaid
     Q7  (txt):  angel  / griffin / dragon  / fairy
     Q8  (pic):  angel  / wizard  / mermaid / dragon
     Q9  (txt):  dragon / griffin / wizard  / fairy
     Q10 (txt):  fairy  / griffin / dragon  / mermaid
  ── */

  function init() {
    const hb = document.getElementById('hamburger');
    const nl = document.getElementById('navLinks') || document.querySelector('.nav-links');
    if (hb && nl) {
      hb.addEventListener('click', () => {
        nl.classList.toggle('open');
        hb.classList.toggle('open');
      });
    }

    document.querySelectorAll('.quiz-screen input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const q = parseInt(radio.name.replace('q', ''));
        answers[q] = radio.value;
        setTimeout(() => advance(), 460);
      });
    });

    /* Share link result from hash */
    const hash = window.location.hash.replace('#', '');
    if (hash && RESULTS[hash]) {
      resultKey = hash;
      showResult();
      showScreen('result');
    }
  }

  function start() { showScreen('q1'); }

  function advance() {
    const next = currentScreen + 1;
    if (next > TOTAL) {
      resultKey = calcResult();
      showResult();
      showScreen('result');
    } else {
      showScreen(`q${next}`);
    }
  }

  function back() {
    if (currentScreen <= 1) showScreen('intro');
    else showScreen(`q${currentScreen - 1}`);
  }

  function showScreen(name) {
    document.querySelectorAll('.quiz-screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`screen-${name}`);
    if (target) {
      target.classList.add('active');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (name === 'intro') currentScreen = 0;
    else if (name === 'result') currentScreen = TOTAL + 1;
    else currentScreen = parseInt(name.replace('q', ''));
  }

  function calcResult() {
    const tally = {};
    Object.values(answers).forEach(val => {
      tally[val] = (tally[val] || 0) + 1;
    });

    let topKey = 'fairy', topCount = 0;
    Object.entries(tally).forEach(([k, c]) => {
      if (c > topCount) { topCount = c; topKey = k; }
    });

    /* Tiebreak: prefer Q7 answer (personality-forward), then Q9 */
    const tied = Object.entries(tally).filter(([, c]) => c === topCount).map(([k]) => k);
    if (tied.length > 1) {
      if (answers[7] && tied.includes(answers[7])) return answers[7];
      if (answers[9] && tied.includes(answers[9])) return answers[9];
      return tied[0];
    }
    return topKey;
  }

  function showResult() {
    const r = RESULTS[resultKey];
    if (!r) return;

    const wrap = document.getElementById('resultWrap');
    if (!wrap) return;

    wrap.className = `result-wrap ${r.bgClass}`;
    wrap.innerHTML = `
      <span class="result-emoji">${r.emoji}</span>
      <p class="result-eyebrow">Your magical archetype is...</p>
      <h2 class="result-name" style="background:${r.nameGrad};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${r.name}</h2>
      <p class="result-desc">${r.desc}</p>
      <p class="result-site-pitch">${r.pitch}</p>
      <div class="result-coupon">
        <p class="result-coupon-label">✦ Your archetype discount</p>
        <div class="result-coupon-code">${r.coupon.code}</div>
        <p class="result-coupon-value">${r.coupon.display} — use this code when you commission your site</p>
      </div>
    `;

    /* Update skip link and all-results link */
    const skipLink = document.getElementById('skipToCommission');
    if (skipLink) skipLink.href = buildCommissionUrl();

    const allLink = document.getElementById('allResultsLink');
    if (allLink) allLink.href = `all-results.html#${resultKey}`;

    history.replaceState(null, '', `#${resultKey}`);
  }

  function buildCommissionUrl(email) {
    const r = RESULTS[resultKey];
    if (!r) return 'commission.html';
    const p = new URLSearchParams({
      fairy: resultKey,
      fairyname: r.name,
      fairydesc: r.pitch,
      coupon: r.coupon.code,
    });
    if (email) p.set('email', email);
    return `commission.html?${p.toString()}`;
  }

  function submitEmail(e) {
    e.preventDefault();
    const email = document.getElementById('resultEmail')?.value?.trim();
    if (!email || !resultKey) return;

    const r = RESULTS[resultKey];
    fetch('https://formspree.io/f/xwvrregv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        email,
        archetype: r?.name || resultKey,
        coupon: r?.coupon?.code,
        source: 'archetype_quiz',
        _subject: `Quiz Lead — ${r?.name || resultKey}`,
      }),
    }).catch(() => {});

    window.location.href = buildCommissionUrl(email);
  }

  function retake() {
    Object.keys(answers).forEach(k => delete answers[k]);
    document.querySelectorAll('.quiz-screen input[type="radio"]').forEach(r => { r.checked = false; });
    resultKey = null;
    history.replaceState(null, '', window.location.pathname);
    showScreen('intro');
  }

  /* ── Sharing ── */
  function share(platform) {
    const r = RESULTS[resultKey];
    if (!r) return;
    const pageUrl = window.location.href;
    const rawText = `I just found out I'm ${r.name}! Take the Faery Tech archetype quiz and find out what you are ✦`;
    const enc = encodeURIComponent(rawText);
    const encUrl = encodeURIComponent(pageUrl);

    if (platform === 'native') {
      if (navigator.share) navigator.share({ title: `I'm ${r.name}!`, text: rawText, url: pageUrl }).catch(() => {});
      else copy();
      return;
    }
    const links = {
      facebook:  `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`,
      twitter:   `https://twitter.com/intent/tweet?text=${enc}&url=${encUrl}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encUrl}&description=${enc}`,
      sms:       `sms:?body=${encodeURIComponent(rawText + ' ' + pageUrl)}`,
      email:     `mailto:?subject=${encodeURIComponent(`I'm ${r.name}! Take the archetype quiz →`)}&body=${encodeURIComponent(rawText + '\n\n' + pageUrl)}`,
    };
    if (links[platform]) {
      if (platform === 'sms' || platform === 'email') window.location.href = links[platform];
      else window.open(links[platform], '_blank', 'width=600,height=500,noopener');
    }
  }

  function copy() {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(flashCopy);
    } else {
      const ta = document.createElement('textarea');
      ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy');
      document.body.removeChild(ta); flashCopy();
    }
  }

  function flashCopy() {
    document.querySelectorAll('.result-share-btns button').forEach(b => {
      if (b.textContent.includes('Copy')) {
        b.textContent = 'Copied! ✦';
        setTimeout(() => { b.textContent = 'Copy Link'; }, 2200);
      }
    });
  }

  /* Expose RESULTS for all-results.html */
  return { init, start, back, submitEmail, share, copy, retake, RESULTS };

})();

document.addEventListener('DOMContentLoaded', Quiz.init);
