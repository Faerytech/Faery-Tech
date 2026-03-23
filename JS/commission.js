/* ============================================================
   commission.js — Faery Tech Commission Page
   Handles: step nav, live pricing, quiz, describe panels,
            copywriting counter, file uploads, form compile
   ============================================================ */

const CommissionApp = (function () {

  /* ── Base price: 1-page site with all "included" features ── */
  const BASE_PRICE = 35;

  /* ── State ── */
  let currentStep = 1;
  const totalSteps = 4;

  /* ── Price tracking ── */
  let lineItems = {}; /* key → { label, price } */

  /* ── Init ── */
  function init() {
    /* Set copyright year */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* Wire hamburger */
    const hb = document.getElementById('hamburger');
    const nl = document.getElementById('navLinks') || document.querySelector('.nav-links');
    if (hb && nl) {
      hb.addEventListener('click', () => {
        nl.classList.toggle('open');
        hb.classList.toggle('open');
      });
    }

    /* Wire all checkboxes in step 3 + 4 */
    document.querySelectorAll('.config-check').forEach(wireCheckbox);

    /* Wire copywriting page counter */
    wireCopyCounter();

    /* Wire timeline radios */
    wireTimeline();

    /* Wire file drop zone */
    wireFileDrop();

    /* Wire hardship toggle */
    wireHardship();

    /* Wire coupon input */
    wireCoupon();

    /* Wire form submit */
    wireFormSubmit();

    /* Initial price render */
    renderPrice();
  }

  /* ── Valid coupon codes and their discount amounts ── */
  const VALID_COUPONS = {
    'ANGEL15':   15,
    'WIZARD10':  10,
    'FAIRY10':   10,
    'DRAGON5':   5,
    'GRIFFIN5':  5,
    'MERMAID5':  5,
  };

  /* ── Wire coupon input ── */
  function wireCoupon() {
    const input  = document.getElementById('coupon-input');
    const status = document.getElementById('coupon-status');
    if (!input) return;

    input.addEventListener('input', () => {
      const code = input.value.trim().toUpperCase();
      if (!code) {
        delete lineItems['coupon'];
        if (status) status.style.display = 'none';
        renderPrice();
        return;
      }

      if (VALID_COUPONS[code] !== undefined) {
        const amount = VALID_COUPONS[code];
        lineItems['coupon'] = { label: `Coupon: ${code}`, price: -amount };
        if (status) {
          status.textContent = `✦ Valid! −$${amount} applied.`;
          status.style.color = 'var(--green)';
          status.style.display = 'block';
        }
      } else {
        delete lineItems['coupon'];
        if (status) {
          status.textContent = 'Code not recognized — check spelling.';
          status.style.color = '#ff8080';
          status.style.display = code.length >= 5 ? 'block' : 'none';
        }
      }
      renderPrice();
    });
  }

  /* ── Step navigation ── */
  function goToStep(n) {
    if (n < 1 || n > totalSteps) return;

    /* Mark current as done */
    const prevDot = document.querySelector(`.comm-step-dot[data-step="${currentStep}"]`);
    if (prevDot) {
      prevDot.classList.remove('active');
      prevDot.classList.add('done');
    }

    /* Mark lines as done up to current */
    document.querySelectorAll('.comm-step-line').forEach((line, i) => {
      line.classList.toggle('done', i < n - 1);
    });

    /* Hide current panel */
    const currentPanel = document.getElementById(`comm-step-${currentStep}`);
    if (currentPanel) currentPanel.classList.remove('active');

    currentStep = n;

    /* Show new panel */
    const nextPanel = document.getElementById(`comm-step-${currentStep}`);
    if (nextPanel) {
      nextPanel.classList.add('active');
      /* Scroll to top of panel smoothly */
      nextPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* Activate dot */
    const nextDot = document.querySelector(`.comm-step-dot[data-step="${n}"]`);
    if (nextDot) {
      nextDot.classList.remove('done');
      nextDot.classList.add('active');
    }

    /* If going to step 4, build summary */
    if (n === 4) buildSummary();
  }

  /* ── Wire a single config checkbox ── */
  function wireCheckbox(cb) {
    const key = cb.dataset.key;
    const price = parseFloat(cb.dataset.price) || 0;
    const label = cb.dataset.label || key;

    /* Describe panel toggle */
    const descPanel = document.getElementById(`desc-${key}`);

    cb.addEventListener('change', () => {
      /* Toggle describe panel */
      if (descPanel) descPanel.classList.toggle('hidden', !cb.checked);

      /* Special: copywriting shows counter instead of static price */
      if (key === 'content-copy') {
        const counter = document.getElementById('copy-counter');
        const staticPrice = document.getElementById('copy-price-static');
        if (counter) counter.classList.toggle('hidden', !cb.checked);
        if (staticPrice) staticPrice.style.display = cb.checked ? 'none' : '';
        if (cb.checked) {
          updateCopyPrice();
        } else {
          delete lineItems['content-copy'];
        }
        renderPrice();
        return;
      }

      /* Update line items */
      if (cb.checked) {
        lineItems[key] = { label, price };
      } else {
        delete lineItems[key];
      }

      renderPrice();
    });
  }

  /* ── Copywriting page counter ── */
  function wireCopyCounter() {
    const input = document.getElementById('copy-pages');
    if (!input) return;
    input.addEventListener('input', updateCopyPrice);
  }

  function updateCopyPrice() {
    const input = document.getElementById('copy-pages');
    const display = document.getElementById('copy-price-live');
    if (!input) return;

    const pages = Math.max(1, parseInt(input.value) || 1);
    const pricePerPage = 50;
    const total = pages * pricePerPage;

    if (display) display.textContent = `+$${total}`;

    const cb = document.getElementById('content-copy');
    if (cb && cb.checked) {
      lineItems['content-copy'] = {
        label: `Copywriting (${pages} page${pages > 1 ? 's' : ''})`,
        price: total
      };
      renderPrice();
    }
  }

  /* ── Timeline radios ── */
  function wireTimeline() {
    document.querySelectorAll('input[name="timeline"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const price = parseFloat(radio.dataset.price) || 0;
        const label = radio.dataset.label || 'Timeline';

        /* Remove any previous timeline entry */
        delete lineItems['timeline'];

        if (price > 0) {
          lineItems['timeline'] = { label, price };
        }

        renderPrice();
      });
    });
  }

  /* ── Hardship toggle ── */
  function wireHardship() {
    const cb = document.getElementById('hardship-flag');
    const desc = document.getElementById('desc-hardship');
    if (!cb || !desc) return;
    cb.addEventListener('change', () => {
      desc.classList.toggle('hidden', !cb.checked);
    });
  }

  /* ── File drop zone ── */
  function wireFileDrop() {
    const zone = document.getElementById('fileDropZone');
    const input = document.getElementById('fileInput');
    const list = document.getElementById('fileList');
    if (!zone || !input || !list) return;

    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));

    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      showFiles(e.dataTransfer.files);
    });

    input.addEventListener('change', () => showFiles(input.files));

    function showFiles(files) {
      list.innerHTML = '';
      Array.from(files).forEach(f => {
        const chip = document.createElement('span');
        chip.className = 'file-chip';
        chip.textContent = f.name;
        list.appendChild(chip);
      });
    }
  }

  /* ── Render live price ── */
  function renderPrice() {
    const total = calcTotal();
    const display = document.getElementById('priceTotalDisplay');
    if (display) display.textContent = `$${total}`;

    /* Build line items in floating bar */
    const linesEl = document.getElementById('priceLineItems');
    if (linesEl) {
      linesEl.innerHTML = '';

      /* Always show base */
      const baseChip = document.createElement('div');
      baseChip.className = 'price-line-item';
      baseChip.innerHTML = `Base site <span>$${BASE_PRICE}</span>`;
      linesEl.appendChild(baseChip);

      /* Add each line item */
      Object.values(lineItems).forEach(item => {
        const chip = document.createElement('div');
        chip.className = `price-line-item${item.price < 0 ? ' discount' : ''}`;
        const sign = item.price >= 0 ? '+' : '−';
        chip.innerHTML = `${truncate(item.label, 22)} <span>${sign}$${Math.abs(item.price)}</span>`;
        linesEl.appendChild(chip);
      });
    }
  }

  function calcTotal() {
    const itemSum = Object.values(lineItems).reduce((sum, item) => sum + item.price, 0);
    return Math.max(10, BASE_PRICE + itemSum);
  }

  function truncate(str, n) {
    return str.length > n ? str.slice(0, n) + '…' : str;
  }

  /* ── Build summary for step 4 ── */
  function buildSummary() {
    const linesEl = document.getElementById('summaryLines');
    const totalEl = document.getElementById('summaryTotal');
    if (!linesEl) return;

    linesEl.innerHTML = '';

    /* Base */
    const baseLine = document.createElement('div');
    baseLine.className = 'summary-line base';
    baseLine.innerHTML = `<span class="summary-line-name">Base site (1 page, all included features)</span><span class="summary-line-price">$${BASE_PRICE}</span>`;
    linesEl.appendChild(baseLine);

    /* Each selected item */
    Object.values(lineItems).forEach(item => {
      const line = document.createElement('div');
      line.className = `summary-line${item.price < 0 ? ' discount' : ''}`;
      const sign = item.price >= 0 ? '+' : '−';
      line.innerHTML = `<span class="summary-line-name">${item.label}</span><span class="summary-line-price">${sign}$${Math.abs(item.price)}</span>`;
      linesEl.appendChild(line);
    });

    if (totalEl) totalEl.textContent = `$${calcTotal()}`;
  }

  /* ── Compile and submit form ── */
  function wireFormSubmit() {
    const form = document.getElementById('commissionForm');
    if (!form) return;

    form.addEventListener('submit', e => {
      /* Compile quiz answers */
      const quizKeys = ['q1','q2','q3','q4','q5','q6','q7'];
      const quizResults = {};
      quizKeys.forEach(k => {
        const checked = document.querySelector(`input[name="${k}"]:checked`);
        if (checked) quizResults[k] = checked.value;
      });
      document.getElementById('hid-quiz').value = JSON.stringify(quizResults);

      /* Compile selected items */
      const selections = Object.entries(lineItems).map(([k, v]) => `${v.label}: $${v.price}`);
      document.getElementById('hid-selections').value = selections.join('\n') || 'None selected beyond base';

      /* Price */
      document.getElementById('hid-estimate').value = `$${calcTotal()}`;

      /* Coupon */
      const couponInput = document.getElementById('coupon-input');
      document.getElementById('hid-coupon').value = couponInput?.value?.trim().toUpperCase() || 'none';

      /* Backyard opt-in */
      const backyardCheck = document.getElementById('disc-sister');
      document.getElementById('hid-backyard').value = backyardCheck?.checked ? 'yes' : 'no';

      /* Timeline */
      const tl = document.querySelector('input[name="timeline"]:checked');
      document.getElementById('hid-timeline').value = tl ? tl.dataset.label : 'Standard (3–4 weeks)';

      /* Business info from step 2 */
      document.getElementById('hid-biz-name').value = document.getElementById('biz-name')?.value || '';
      document.getElementById('hid-contact').value = document.getElementById('contact-name')?.value || '';
      document.getElementById('hid-email').value = document.getElementById('contact-email')?.value || '';
      document.getElementById('hid-phone').value = document.getElementById('contact-phone')?.value || '';
      document.getElementById('hid-biz-desc').value = document.getElementById('biz-desc')?.value || '';
      document.getElementById('hid-existing-url').value = document.getElementById('existing-url')?.value || '';
      document.getElementById('hid-existing-notes').value = document.getElementById('existing-notes')?.value || '';
      document.getElementById('hid-hate-colors').value = document.getElementById('hate-colors')?.value || '';

      /* Validate step 2 fields before submit */
      const bizName = document.getElementById('biz-name')?.value.trim();
      const contactName = document.getElementById('contact-name')?.value.trim();
      const email = document.getElementById('contact-email')?.value.trim();

      if (!bizName || !contactName || !email) {
        e.preventDefault();
        alert('Please go back to Step 2 and fill in your business name, your name, and email address.');
        goToStep(2);
        return;
      }

      /* Let Formspree handle the rest */
    });
  }

  /* ── Public API ── */
  return { goToStep, init };

})();

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', CommissionApp.init);
