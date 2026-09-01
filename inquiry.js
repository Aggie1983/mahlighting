// Magic Home Lighting - Inquiry Basket + FormSubmit
// Includes itself: floating button, modal, toast, add-to-inquiry handlers.
// FormSubmit AJAX: https://formsubmit.co/ajax/al@magichomelighting.com
(function () {
  const STORAGE_KEY = 'mhl_inquiry';
  const FORMSUBMIT = 'https://formsubmit.co/ajax/al@magichomelighting.com';

  const style = document.createElement('style');
  style.textContent = `
  #inquiryFab{position:fixed;right:24px;bottom:24px;z-index:90;background:var(--gold,#c9a84c);color:#0a0a0a;width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.4);font-size:24px;transition:transform .2s ease,background .2s ease;border:none}
  #inquiryFab:hover{transform:translateY(-3px);background:#d8b85a}
  #inquiryBadge{position:absolute;top:-6px;right:-6px;background:#e74c3c;color:#fff;min-width:22px;height:22px;border-radius:11px;font-size:12px;font-weight:700;display:none;align-items:center;justify-content:center;padding:0 6px;line-height:1}
  #inquiryModal{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:100;display:none;align-items:flex-start;justify-content:center;padding:5vh 20px;overflow:auto}
  #inquiryModal.open{display:flex}
  #inquiryModal .box{background:#fff;max-width:760px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.4);max-height:90vh;display:flex;flex-direction:column}
  #inquiryModal header{background:#0a0a0a;color:#fff;padding:20px 24px;display:flex;justify-content:space-between;align-items:center}
  #inquiryModal header h3{margin:0;font-size:20px;letter-spacing:.5px}
  #inquiryModal header small{color:var(--gold,#c9a84c);font-weight:400;margin-left:8px;font-size:13px}
  #inquiryModal .close{background:none;border:none;color:#fff;font-size:28px;cursor:pointer;line-height:1;padding:0 4px}
  #inquiryModal .body{padding:24px;overflow:auto;flex:1}
  #inquiryModal .items{display:flex;flex-direction:column;gap:10px;margin-bottom:18px}
  #inquiryModal .item{display:flex;gap:12px;align-items:center;background:#f7f5f0;padding:10px 12px;border-radius:8px;border:1px solid #ece6d4}
  #inquiryModal .item img{width:54px;height:54px;object-fit:contain;background:#0a0a0a;border-radius:4px;flex-shrink:0}
  #inquiryModal .item .info{flex:1;min-width:0}
  #inquiryModal .item .name{font-size:14px;font-weight:600;color:#0a0a0a;line-height:1.3;margin:0 0 2px}
  #inquiryModal .item .cat{font-size:11px;color:#999;letter-spacing:1px;text-transform:uppercase}
  #inquiryModal .item .rm{background:none;border:none;color:#e74c3c;font-size:18px;cursor:pointer;padding:4px 8px}
  #inquiryModal .item .rm:hover{color:#c0392b}
  #inquiryModal form{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  #inquiryModal form .full{grid-column:1/-1}
  #inquiryModal form label{font-size:12px;color:#666;display:block;margin-bottom:4px;letter-spacing:.5px;text-transform:uppercase;font-weight:600}
  #inquiryModal form input, #inquiryModal form textarea{width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:6px;font-family:inherit;font-size:14px;box-sizing:border-box;background:#fff}
  #inquiryModal form input:focus, #inquiryModal form textarea:focus{outline:none;border-color:var(--gold,#c9a84c);box-shadow:0 0 0 3px rgba(201,168,76,.15)}
  #inquiryModal form textarea{resize:vertical;min-height:80px}
  #inquiryModal form .actions{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;margin-top:8px;gap:12px;flex-wrap:wrap}
  #inquiryModal form .actions .hint{font-size:12px;color:#999}
  #inquiryModal form button[type=submit]{background:var(--gold,#c9a84c);color:#0a0a0a;border:none;padding:12px 28px;font-size:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;border-radius:6px;transition:background .2s ease}
  #inquiryModal form button[type=submit]:hover:not(:disabled){background:#d8b85a}
  #inquiryModal form button[type=submit]:disabled{opacity:.5;cursor:not-allowed}
  #inquiryModal .empty{text-align:center;padding:40px 20px;color:#999}
  #inquiryModal .empty .icon{font-size:48px;margin-bottom:8px}
  #inquiryToast{position:fixed;bottom:96px;right:24px;background:#0a0a0a;color:#fff;padding:12px 20px;border-radius:8px;font-size:14px;z-index:200;opacity:0;pointer-events:none;transition:opacity .3s ease,transform .3s ease;transform:translateY(8px);max-width:280px;box-shadow:0 8px 24px rgba(0,0,0,.3)}
  #inquiryToast.show{opacity:1;transform:translateY(0)}
  @media(max-width:600px){#inquiryModal form{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  function getBasket() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } }
  function saveBasket(b) { localStorage.setItem(STORAGE_KEY, JSON.stringify(b)); refreshBadge(); }
  function addToBasket(item) { const b = getBasket(); if (b.find(x => x.handle === item.handle)) return false; b.push(item); saveBasket(b); return true; }
  function removeFromBasket(handle) { const b = getBasket().filter(x => x.handle !== handle); saveBasket(b); renderBasket(); }
  function refreshBadge() { const n = getBasket().length; const b = document.getElementById('inquiryBadge'); if (b) { b.textContent = n; b.style.display = n > 0 ? 'flex' : 'none'; } }

  let toastTimer;
  function showToast(msg) {
    const t = document.getElementById('inquiryToast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  function buildModal() {
    if (document.getElementById('inquiryModal')) return;
    const div = document.createElement('div');
    div.id = 'inquiryModal';
    div.innerHTML = `
      <div class="box">
        <header>
          <h3>Your Inquiry Basket<small id="hdrCount"></small></h3>
          <button class="close" aria-label="Close">&times;</button>
        </header>
        <div class="body">
          <div class="items" id="inquiryItems"></div>
          <form id="inquiryForm" novalidate>
            <div><label>Your Name *</label><input name="name" required></div>
            <div><label>Email *</label><input name="email" type="email" required></div>
            <div><label>Company</label><input name="company"></div>
            <div><label>WhatsApp</label><input name="whatsapp" placeholder="+86 ..."></div>
            <div class="full"><label>Message / Special Requirements</label><textarea name="message" placeholder="Quantities, target price, delivery time, customizations..."></textarea></div>
            <input type="hidden" name="_subject" value="New inquiry from mahlighting.com">
            <input type="hidden" name="_captcha" value="false">
            <input type="hidden" name="_template" value="table">
            <div class="actions">
              <span class="hint">Reply within 24 hours. We respect your privacy.</span>
              <button type="submit">Send Inquiry</button>
            </div>
          </form>
        </div>
      </div>`;
    document.body.appendChild(div);
    div.querySelector('.close').addEventListener('click', closeBasket);
    div.addEventListener('click', e => { if (e.target === div) closeBasket(); });
    document.getElementById('inquiryForm').addEventListener('submit', onSubmit);
  }

  function buildFab() {
    if (document.getElementById('inquiryFab')) return;
    const btn = document.createElement('button');
    btn.id = 'inquiryFab';
    btn.title = 'Inquiry Basket';
    btn.setAttribute('aria-label', 'Inquiry Basket');
    btn.innerHTML = '✉<span id="inquiryBadge">0</span>';
    btn.addEventListener('click', openBasket);
    document.body.appendChild(btn);
    const t = document.createElement('div');
    t.id = 'inquiryToast';
    document.body.appendChild(t);
  }

  function openBasket() { buildModal(); renderBasket(); document.getElementById('inquiryModal').classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeBasket() { const m = document.getElementById('inquiryModal'); if (m) m.classList.remove('open'); document.body.style.overflow = ''; }

  function renderBasket() {
    const items = getBasket();
    const list = document.getElementById('inquiryItems');
    const hdr = document.getElementById('hdrCount');
    if (hdr) hdr.textContent = items.length ? `(${items.length} item${items.length > 1 ? 's' : ''})` : '';
    if (!list) return;
    if (!items.length) { list.innerHTML = '<div class="empty"><div class="icon">🛒</div>Your inquiry basket is empty.<br>Click <b>Add to Inquiry</b> on any product to start.</div>'; return; }
    list.innerHTML = items.map(it => `
      <div class="item">
        <img src="${it.img}" alt="" onerror="this.style.background='#222'">
        <div class="info">
          <p class="name">${esc(it.name)}</p>
          <span class="cat">${esc(it.cat)}</span>
        </div>
        <button class="rm" data-handle="${esc(it.handle)}" title="Remove">&times;</button>
      </div>`).join('');
    list.querySelectorAll('.rm').forEach(b => b.addEventListener('click', () => removeFromBasket(b.dataset.handle)));
  }

  function esc(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const items = getBasket();
    if (!items.length) { showToast('Your basket is empty.'); return; }
    const fd = new FormData(form);
    if (!fd.get('name') || !fd.get('email')) { showToast('Please fill in your name and email.'); return; }
    const submitBtn = form.querySelector('button[type=submit]');
    submitBtn.disabled = true; submitBtn.textContent = 'Sending...';
    const payload = {
      _subject: `[Inquiry] ${fd.get('name')} — ${items.length} product(s) from mahlighting.com`,
      _captcha: 'false',
      _template: 'table',
      name: fd.get('name'),
      email: fd.get('email'),
      company: fd.get('company') || '',
      whatsapp: fd.get('whatsapp') || '',
      message: fd.get('message') || '',
      products: items.map((it, i) => `${i + 1}. ${it.name}  [${it.cat}]  (ref: ${it.handle})`).join('\n'),
      item_count: items.length,
      source: 'mahlighting.com inquiry basket'
    };
    try {
      const res = await fetch(FORMSUBMIT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        saveBasket([]);
        renderBasket();
        showToast('✅ Inquiry sent! We will reply within 24 hours.');
        setTimeout(closeBasket, 1200);
        form.reset();
      } else {
        showToast('Send failed. Please email us directly at al@magichomelighting.com');
      }
    } catch (err) {
      showToast('Network error. Please email us directly at al@magichomelighting.com');
    } finally {
      submitBtn.disabled = false; submitBtn.textContent = 'Send Inquiry';
    }
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('.add-inquiry');
    if (btn) {
      e.preventDefault();
      const item = { name: btn.dataset.name, cat: btn.dataset.cat, img: btn.dataset.img, handle: btn.dataset.handle };
      const added = addToBasket(item);
      showToast(added ? `✓ Added: ${item.name}` : `Already in your basket: ${item.name}`);
    }
  });

  document.addEventListener('DOMContentLoaded', () => { buildFab(); refreshBadge(); });
  if (document.readyState !== 'loading') { buildFab(); refreshBadge(); }
})();
