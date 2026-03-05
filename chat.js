/* ============================================================
   FAERY TECH — chat.js
   AI chat widget — powered by Cloudflare Worker proxy
   ============================================================ */

/* ── INJECT CHAT HTML ── */
document.body.insertAdjacentHTML('beforeend', `
  <button id="chat-toggle" title="Chat with Faery Tech">✦</button>
  <div id="chat-window">
    <div id="chat-header">
      <div class="chat-avatar">🧚</div>
      <div>
        <div class="chat-title">Faery Tech Assistant</div>
        <div class="chat-subtitle">Ask about services, pricing & more</div>
      </div>
    </div>
    <div id="chat-messages"></div>
    <div id="chat-input-area">
      <input id="chat-input" type="text" placeholder="Ask about services, pricing..." maxlength="300">
      <button id="chat-send">➤</button>
    </div>
  </div>
`);

/* ── SYSTEM PROMPT ── */
const SYSTEM_PROMPT = `You are a friendly assistant for Faery Tech, a small web design studio and digital services company run by Madyson Moore, based in Hattiesburg, Mississippi.

Your job is to answer questions about Faery Tech's services, packages, pricing, and how to get started. Be warm, concise, and helpful.

SERVICES & PRICING:

WEBSITE DESIGN (one-time):
- Starter Site: $80–100 — single page, mobile-friendly, contact form, basic SEO, hosted on GitHub Pages
- Growth Package: $200–300 — up to 5 pages, portfolio, booking calendar, SEO, social media setup, content writing
- Full Business Package: $400–600 — everything in Growth plus WordPress CMS, logo design, brand palette, photography, email marketing setup, Google Business profile
- Complete Digital Transformation: $800–1,500+ — everything above plus client portal, online payments, autopay, invoicing, appointment booking, automated reminders, CRM, staff training

MONTHLY SERVICES:
- Care & Updates: $40–60/month — content updates, security, performance, priority support
- Social Media Management: $100–150/month — 12+ posts/month, content writing, graphics, auto-replies, reporting
- Email Marketing: $75–100/month — monthly newsletter, list management, automated sequences, tracking
- SEO & Visibility: $75/month — keyword optimization, Google Business management, local search, reviews

CREATIVE ADD-ONS (one-time):
- Logo Design: $50–100 — 2-3 concepts, 2 revisions, PNG/SVG/PDF files
- Photography: $50–150/session — on-location (Hattiesburg area), product/storefront/team, stock sourcing also available
- Content Writing: $30–75/page — website copy, SEO-optimized, blog posts available

SPECIAL RATES:
- Hardship/sliding scale: starting at $50 — just ask, no one gets left behind
- Revenue share option: small upfront cost + small % of revenue for 6-12 months
- Nonprofits & eco organizations: special discounted rates
- Animal shelters: special rates and support

BOOKING & CONTACT:
- Free 15-minute intro call: https://calendly.com/faerytech
- Contact form: the contact page of this website
- Response time: within 24-48 hours

ABOUT FAERY TECH:
- Founded by Madyson Moore, a web developer based in Hattiesburg, MS
- Custom-coded sites only — no cookie-cutter templates
- Part of a growing network called "The Neighborhood" — a community digital ecosystem coming soon
- Mission: technology should be accessible to everyone, profit and purpose are not opposites
- Ethical advertising only — partners with eco-friendly brands, supports animal shelters and environmental causes

RULES:
- Only answer questions about Faery Tech's services, pricing, process, mission, or how to get started
- If asked something unrelated, politely say: "I'm only set up to help with Faery Tech questions! Feel free to reach out via the contact form for anything else."
- Keep responses to 2-4 sentences max — warm and helpful
- Never make up information not listed above
- For complex custom projects always suggest booking a free call`;

const history = [];

const toggle   = document.getElementById('chat-toggle');
const chatWin  = document.getElementById('chat-window');
const messages = document.getElementById('chat-messages');
const input    = document.getElementById('chat-input');
const sendBtn  = document.getElementById('chat-send');

let isOpen = false;

toggle.addEventListener('click', () => {
  isOpen = !isOpen;
  chatWin.classList.toggle('open', isOpen);
  toggle.textContent = isOpen ? '✕' : '✦';
  if (isOpen && messages.children.length === 0) {
    addMessage('bot', 'Hi! ✦ I\'m the Faery Tech assistant. Ask me about our services, pricing, or how to get started!');
  }
  if (isOpen) input.focus();
});

function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'msg typing';
  div.id = 'typing-indicator';
  div.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function hideTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text || sendBtn.disabled) return;

  addMessage('user', text);
  input.value = '';
  sendBtn.disabled = true;
  history.push({ role: 'user', content: text });
  showTyping();

  try {
    const response = await fetch('https://faerytech-chat.moore-madyson.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: history
      })
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || "Sorry, something went wrong! Please try the contact form instead.";
    history.push({ role: 'assistant', content: reply });
    hideTyping();
    addMessage('bot', reply);

  } catch (err) {
    hideTyping();
    addMessage('bot', 'Having trouble connecting right now! Please use the contact form or book a free call instead.');
  }

  sendBtn.disabled = false;
  input.focus();
}

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });