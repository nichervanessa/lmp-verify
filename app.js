// app.js — Main application logic with Auth gating

let html5QrCode = null;
window._scannerRunning = false;
let currentUser = null; // Firebase auth user

// ── On load ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Nav scroll effect
  window.addEventListener('scroll', () => {
    document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 20);
  });

  // Input live clear button
  const input = document.getElementById('invoiceInput');
  const clearBtn = document.getElementById('clearBtn');
  input?.addEventListener('input', () => {
    clearBtn.style.display = input.value ? 'flex' : 'none';
  });

  // Enter key support
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') verifyInvoice();
  });

  // Login password enter key
  document.getElementById('loginPassword')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doLogin();
  });
  document.getElementById('loginEmail')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('loginPassword').focus();
  });

  // Auto-fill from URL ?code=INV-...
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code') || params.get('invoice');
  if (code) {
    input.value = code;
    clearBtn.style.display = 'flex';
    setTimeout(() => {
      document.getElementById('verify')?.scrollIntoView({ behavior: 'smooth' });
      verifyInvoice();
    }, 800);
  }

  // Load verification count for hero
  try {
    const total = await getTotalVerifications();
    const el = document.getElementById('statInvoices');
    if (el && total > 0) el.textContent = total.toLocaleString() + '+';
    else if (el) el.textContent = '100+';
  } catch { /* ignore */ }

  // Restore recent verifications
  renderRecentChecks();

  // Watch Firebase Auth state
  firebase.auth().onAuthStateChanged((user) => {
    currentUser = user;
    updateNavAuth(user);
  });
});

// ── Auth UI ────────────────────────────────────────────────────────────────
function updateNavAuth(user) {
  const btn   = document.getElementById('navAuthBtn');
  const label = document.getElementById('navAuthLabel');
  if (!btn || !label) return;

  if (user) {
    // Logged in: show email initial + Logout
    const initials = (user.displayName || user.email || '?').charAt(0).toUpperCase();
    label.textContent = initials + ' Logout';
    btn.classList.add('logged-in');
  } else {
    label.textContent = 'Login';
    btn.classList.remove('logged-in');
  }
}

function handleAuthClick() {
  if (currentUser) {
    firebase.auth().signOut().then(() => showToast('Logged out successfully'));
  } else {
    openLoginModal();
  }
}

function openLoginModal() {
  const modal = document.getElementById('loginModal');
  modal.classList.add('open');
  document.getElementById('loginEmail')?.focus();
  document.getElementById('loginError').style.display = 'none';
}

function closeLoginModal() {
  document.getElementById('loginModal').classList.remove('open');
}

// Close modal on overlay click
document.getElementById('loginModal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('loginModal')) closeLoginModal();
});

function togglePw() {
  const pw = document.getElementById('loginPassword');
  const btn = document.getElementById('pwToggle');
  if (pw.type === 'password') {
    pw.type = 'text';
    btn.textContent = '🙈';
  } else {
    pw.type = 'password';
    btn.textContent = '👁';
  }
}

async function doLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('loginError');
  const btn      = document.getElementById('loginBtn');
  const spinner  = document.getElementById('loginSpinner');
  const btnText  = document.getElementById('loginBtnText');

  errEl.style.display = 'none';
  if (!email || !password) {
    errEl.textContent = 'Please enter your email and password.';
    errEl.style.display = 'block';
    return;
  }

  btn.disabled = true;
  btnText.style.display = 'none';
  spinner.style.display = 'block';

  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    closeLoginModal();
    showToast('Welcome back! You are now logged in.');
    // Re-render current result if any
    const resultArea = document.getElementById('resultArea');
    if (resultArea.style.display !== 'none' && resultArea.dataset.invoiceData) {
      try {
        const d = JSON.parse(resultArea.dataset.invoiceData);
        showResult({ found: true, data: d }, d.invoiceNumber);
      } catch {}
    }
  } catch (err) {
    let msg = 'Login failed. Please check your credentials.';
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      msg = 'Incorrect email or password.';
    } else if (err.code === 'auth/too-many-requests') {
      msg = 'Too many attempts. Please try again later.';
    } else if (err.code === 'auth/invalid-email') {
      msg = 'Please enter a valid email address.';
    }
    errEl.textContent = msg;
    errEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btnText.style.display = 'inline';
    spinner.style.display = 'none';
  }
}

// ── Tab switching ──────────────────────────────────────────────────────────
function switchTab(tab) {
  ['manual','scan'].forEach(t => {
    document.getElementById(`tab-${t}`)?.classList.toggle('active', t === tab);
    document.getElementById(`pane-${t}`)?.classList.toggle('active', t === tab);
  });
  if (tab !== 'scan' && window._scannerRunning) stopScanner();
}

// ── Nav burger ─────────────────────────────────────────────────────────────
function toggleNav() {
  document.getElementById('navLinks')?.classList.toggle('open');
}

// Close nav on link click (mobile)
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks')?.classList.remove('open');
  });
});

// ── Clear input ────────────────────────────────────────────────────────────
function clearInput() {
  const input = document.getElementById('invoiceInput');
  input.value = '';
  document.getElementById('clearBtn').style.display = 'none';
  const ra = document.getElementById('resultArea');
  ra.style.display = 'none';
  delete ra.dataset.invoiceData;
  input.focus();
}

// ── Main verify function ───────────────────────────────────────────────────
async function verifyInvoice(codeOverride) {
  const input = document.getElementById('invoiceInput');
  const code  = (codeOverride || input?.value || '').trim();

  if (!code) {
    showToast('Please enter an invoice number');
    input?.focus();
    return;
  }

  // Loading state
  const btn     = document.getElementById('verifyBtn');
  const btnText = document.getElementById('verifyBtnText');
  const spinner = document.getElementById('btnSpinner');
  if (btn) btn.disabled = true;
  if (btnText) btnText.style.display = 'none';
  if (spinner) spinner.style.display = 'block';

  const resultArea = document.getElementById('resultArea');
  resultArea.style.display = 'none';

  try {
    const result = await lookupInvoice(code);
    await showResult(result, code);
    saveRecentCheck(code, result.found);
    renderRecentChecks();
  } catch (err) {
    console.error('Verify error:', err);
    showResult({ found: false, error: err.message }, code);
  } finally {
    if (btn) btn.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (spinner) spinner.style.display = 'none';
  }
}

// ── Result card ────────────────────────────────────────────────────────────
async function showResult(result, code) {
  const area = document.getElementById('resultArea');
  area.style.display = 'block';

  if (result.found) {
    const d = result.data;

    // Cache invoice data for re-render after login
    area.dataset.invoiceData = JSON.stringify(d);

    const typeLabel      = getTypeLabel(d.type);
    const typeBadgeClass = `type-${d.type || 'payment'}`;
    const isStaff        = !!currentUser;

    // Increment verification counter (non-blocking)
    if (d.id) recordVerification(d.id);

    // Public info always visible
    // Staff info: full grid visible; guest: blurred + login prompt
    const staffGrid = `
      <div class="result-grid ${!isStaff ? 'staff-only-blur' : ''}">
        <div class="result-field">
          <label>${t('result.invoice')}</label>
          <span style="font-family:monospace;font-size:12px">${d.invoiceNumber || code}</span>
        </div>
        <div class="result-field">
          <label>${t('result.customer')}</label>
          <span>${d.customer?.name || d.customerName || '—'}</span>
        </div>
        ${getAmountField(d)}
        <div class="result-field">
          <label>${t('result.date')}</label>
          <span>${formatDate(d.date || d.createdAt || d.data?.date)}</span>
        </div>
        <div class="result-field">
          <label>${t('result.company')}</label>
          <span>${d.company?.name || 'Loan Management Pro'}</span>
        </div>
        <div class="result-field">
          <label>${t('result.created')}</label>
          <span>${formatDate(d.createdAt || d.issuedAt)}</span>
        </div>
        ${d.verificationCount !== undefined ? `
        <div class="result-field">
          <label>${t('result.verifyCount')}</label>
          <span>${(d.verificationCount + 1).toLocaleString()}</span>
        </div>` : ''}
        ${getStatusField(d)}
      </div>
    `;

    const staffActions = isStaff ? `
      <div class="result-actions" style="flex-wrap:wrap;gap:8px">
        <button class="result-btn primary" onclick="viewFullInvoice(${JSON.stringify(d).replace(/"/g, '&quot;')})" style="flex:2;min-width:160px">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          View Full Invoice
        </button>
        <button class="result-btn primary" onclick="printFullInvoice(${JSON.stringify(d).replace(/"/g, '&quot;')})" style="flex:1;min-width:120px;background:#0f766e">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print
        </button>
        <button class="result-btn ghost" onclick="downloadVerificationReport(${JSON.stringify(d).replace(/"/g, '&quot;')})" style="flex:1;min-width:120px">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download
        </button>
        <button class="result-btn ghost" onclick="clearInput();" style="flex:1;min-width:120px">
          Verify Another
        </button>
      </div>
    ` : `
      <div class="staff-unlock-banner">
        <p>🔐 Staff login required to view full invoice details, print, or download.</p>
        <button onclick="openLoginModal()">Login to View Full Invoice</button>
      </div>
      <div style="padding:10px 18px 18px">
        <button class="result-btn ghost" style="width:100%" onclick="clearInput();">Verify Another Invoice</button>
      </div>
    `;

    area.innerHTML = `
      <div class="result-card success">
        <div class="result-header">
          <div class="result-icon ok">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <div class="result-title">${t('result.verified')}</div>
            <div class="result-subtitle">${t('result.verifiedSub')} <strong>${d.company?.name || 'Loan Management Pro'}</strong></div>
          </div>
          <div style="margin-left:auto">
            <span class="type-badge ${typeBadgeClass}">${typeLabel}</span>
          </div>
        </div>

        ${staffGrid}
        ${staffActions}
      </div>
    `;

  } else {
    area.innerHTML = `
      <div class="result-card error">
        <div class="result-header" style="background:var(--red-100);border-color:rgba(239,68,68,0.2)">
          <div class="result-icon err">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <div class="result-title">${t('result.notFound')}</div>
            <div class="result-subtitle">${t('result.notFoundSub')}</div>
          </div>
        </div>
        <div style="padding:16px 18px;background:var(--white)">
          <p style="color:#64748b;font-size:14px;margin-bottom:16px">
            Code searched: <code style="background:#f1f5f9;padding:2px 8px;border-radius:6px;font-size:13px">${escapeHtml(code)}</code>
          </p>
          <div class="result-actions">
            <button class="result-btn ghost" onclick="clearInput()">
              ${t('result.verifyAnotherBtn')}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Amount & Status helpers ────────────────────────────────────────────────
function getAmountField(d) {
  let amount = null;
  if (d.data?.amount) amount = d.data.amount;
  else if (d.data?.loanAmount) amount = d.data.loanAmount;
  else if (d.amount) amount = d.amount;
  if (!amount) return '';
  return `<div class="result-field">
    <label>${t('result.amount')}</label>
    <span style="color:#1d4ed8;font-weight:800">${Number(amount).toLocaleString()} IQD</span>
  </div>`;
}

function getStatusField(d) {
  const status = d.data?.status || d.status;
  if (!status) return '';
  const map = { active: '#1d4ed8', completed: '#16a34a', overdue: '#dc2626', pending: '#92400e' };
  const color = map[status] || '#64748b';
  return `<div class="result-field">
    <label>${t('result.status')}</label>
    <span style="color:${color};font-weight:700;text-transform:capitalize">${status}</span>
  </div>`;
}

function getTypeLabel(type) {
  const map = { payment: t('result.paymentType'), loan: t('result.loanType'), customer: t('result.customerType') };
  return map[type] || type || 'Invoice';
}

// ── Full invoice HTML builder ──────────────────────────────────────────────
function buildInvoiceHtmlFromData(d) {
  const fmtN = n => Number(n||0).toLocaleString('en-IQ',{minimumFractionDigits:0,maximumFractionDigits:0});
  const fmtD = s => {
    if (!s) return '—';
    try {
      if (s.seconds) return new Date(s.seconds*1000).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
      return new Date(s).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
    } catch { return String(s); }
  };
  const primary = '#1e3a8a', accent = '#2563eb';
  const sd = d.data || {};
  const verifyURL = `https://verify.amezona.com?code=${d.invoiceNumber}`;
  const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&format=png&ecc=H&margin=4&data=${encodeURIComponent(verifyURL)}`;

  let rows = '';
  if (d.type === 'payment') {
    rows = `
      <tr class="hl"><td>Amount Paid</td><td>${fmtN(sd.amount)} IQD</td></tr>
      <tr><td>Payment Date</td><td>${fmtD(sd.date)}</td></tr>
      <tr><td>Loan Reference</td><td>${sd.loanId||'—'}</td></tr>
      <tr><td>Method</td><td>${sd.method||'Cash'}</td></tr>
      ${sd.note?`<tr><td>Note</td><td>${sd.note}</td></tr>`:''}
    `;
  } else if (d.type === 'loan') {
    rows = `
      <tr class="hl"><td>Loan Amount</td><td>${fmtN(sd.loanAmount)} IQD</td></tr>
      <tr><td>Monthly Payment</td><td>${fmtN(sd.monthlyPayment)} IQD</td></tr>
      <tr><td>Duration</td><td>${sd.duration||'—'} months</td></tr>
      <tr><td>Start Date</td><td>${fmtD(sd.startDate)}</td></tr>
      <tr><td>End Date</td><td>${fmtD(sd.endDate)}</td></tr>
      <tr><td>Status</td><td>${sd.status||'—'}</td></tr>
      <tr><td>Total Paid</td><td>${fmtN(sd.totalPaid)} IQD</td></tr>
      <tr><td>Remaining</td><td>${fmtN(sd.remaining)} IQD</td></tr>
    `;
  } else {
    rows = `<tr class="hl"><td>Total Portfolio</td><td>${fmtN(sd.totalAmount)} IQD</td></tr>
            <tr><td>Total Loans</td><td>${sd.totalLoans||0}</td></tr>`;
  }

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${d.invoiceNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
@page{size:A4;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#fff;color:#1e293b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;min-height:297mm;margin:0 auto;display:flex;flex-direction:column}
.stripe{height:5px;background:linear-gradient(90deg,${primary},${accent})}
.v-banner{background:#f0fdf4;border-bottom:2px solid #86efac;padding:9px 36px;display:flex;align-items:center;gap:10px;font-size:12px;color:#166534;font-weight:700}
.hdr{padding:24px 36px 18px;display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #f1f5f9}
.co-circle{width:44px;height:44px;border-radius:11px;background:linear-gradient(135deg,${primary},${accent});display:flex;align-items:center;justify-content:center;flex-shrink:0}
.co-name{font-size:15px;font-weight:800;color:#0f172a;margin-bottom:2px}
.co-line{font-size:9px;color:#94a3b8;margin:1px 0}
.inv-lbl{font-size:28px;font-weight:900;letter-spacing:3px;color:${primary};display:block;margin-bottom:6px}
.pill{display:inline-flex;align-items:center;gap:5px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:3px 9px;font-size:9.5px;color:#475569;margin:2px 0;white-space:nowrap}
.pill b{color:#0f172a;font-weight:700}
.body{flex:1;padding:20px 36px}
.billing{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px}
.bc{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;border-left:3px solid ${accent}}
.bc-lbl{font-size:8.5px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#94a3b8;margin-bottom:7px}
.bc-name{font-size:12px;font-weight:700;color:#0f172a;margin-bottom:3px}
.bc p{font-size:10px;color:#64748b;margin:2px 0}
.sec-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;padding-bottom:7px;border-bottom:2px solid #f1f5f9;margin-bottom:0}
table{width:100%;border-collapse:collapse}
tr{border-bottom:1px solid #f1f5f9}
td{padding:9px 6px;font-size:11px}
td:first-child{color:#64748b;font-weight:500;width:45%}
td:last-child{font-weight:700;color:#0f172a;text-align:right}
tr.hl td{background:#eff6ff;color:#1d4ed8}
.ftr{padding:14px 36px 16px;border-top:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center}
.ftr-terms h6{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:4px}
.ftr-terms p{font-size:8.5px;color:#94a3b8;margin:1px 0}
.qr-box{text-align:center;flex-shrink:0}
.qr-img{width:92px;height:92px;border:1px solid #e2e8f0;border-radius:8px;padding:3px;background:#fff;display:block}
.qr-lbl{font-size:7.5px;color:#94a3b8;margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:.8px}
.pg{text-align:center;font-size:8px;color:#cbd5e1;padding-bottom:10px}
@media print{body{margin:0}.page{width:100%;min-height:100vh}}
</style>
</head><body>
<div class="page">
<div class="stripe"></div>
<div class="v-banner">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
  VERIFIED &amp; AUTHENTIC — Issued by ${d.company?.name||'Loan Management Pro'}
</div>
<div class="hdr">
  <div style="display:flex;align-items:flex-start;gap:12px">
    <div class="co-circle">
      <svg viewBox="0 0 32 32" fill="none" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="9" width="26" height="18" rx="3" stroke="white" stroke-width="1.8"/>
        <path d="M3 15h26" stroke="white" stroke-width="1.8"/>
        <circle cx="8" cy="22" r="1.5" fill="white"/>
        <rect x="13" y="20.5" width="11" height="3" rx="1" fill="white"/>
      </svg>
    </div>
    <div>
      <div class="co-name">${d.company?.name||'Loan Management Pro'}</div>
      <div class="co-line">📍 ${d.company?.address||''}</div>
      <div class="co-line">📞 ${d.company?.phone||''} | ✉️ ${d.company?.email||''}</div>
      <div class="co-line">🌐 ${d.company?.website||'verify.amezona.com'}</div>
    </div>
  </div>
  <div style="text-align:right">
    <span class="inv-lbl">INVOICE</span>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">
      <div class="pill">Invoice # <b>${d.invoiceNumber}</b></div>
      <div class="pill">Issued <b>${fmtD(d.issuedAt||d.createdAt)}</b></div>
      <div class="pill">Type <b>${(d.type||'invoice').toUpperCase()}</b></div>
    </div>
  </div>
</div>
<div class="body">
  <div class="billing">
    <div class="bc">
      <div class="bc-lbl">Billed To</div>
      <div class="bc-name">${d.customer?.name||'—'}</div>
      ${d.customer?.phone?`<p>📞 ${d.customer.phone}</p>`:''}
      ${d.customer?.email?`<p>✉️ ${d.customer.email}</p>`:''}
    </div>
    <div class="bc">
      <div class="bc-lbl">Issued By</div>
      <div class="bc-name">${d.company?.name||'Loan Management Pro'}</div>
      ${d.company?.address?`<p>📍 ${d.company.address}</p>`:''}
      ${d.company?.email?`<p>✉️ ${d.company.email}</p>`:''}
    </div>
  </div>
  <div class="sec-title">Invoice Details</div>
  <table><tbody>${rows}</tbody></table>
</div>
<div class="ftr">
  <div class="ftr-terms">
    <h6>Verification Certificate</h6>
    <p>Verified on ${new Date().toLocaleString()} via verify.amezona.com</p>
    <p>© ${new Date().getFullYear()} ${d.company?.name||'Loan Management Pro'}. All rights reserved.</p>
  </div>
  <div class="qr-box">
    <img class="qr-img" src="${qrURL}" alt="QR"
         onerror="this.src='https://api.qrserver.com/v1/create-qr-code/?size=92x92&data=${encodeURIComponent(d.invoiceNumber)}'"/>
    <div class="qr-lbl">Scan to re-verify</div>
  </div>
</div>
<div class="pg">Page 1 of 1 | ${d.invoiceNumber} | verify.amezona.com</div>
</div>
</body></html>`;
}

// ── View invoice in overlay (staff only) ──────────────────────────────────
function viewFullInvoice(data) {
  if (!currentUser) { openLoginModal(); return; }
  if (typeof data === 'string') { try { data = JSON.parse(data); } catch { return; } }

  const overlay = document.createElement('div');
  overlay.id = '__inv_overlay__';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;flex-direction:column;';
  overlay.innerHTML = `
    <div style="background:#1e293b;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
      <div style="color:#fff;font-weight:600;font-size:14px">📄 ${data.invoiceNumber}</div>
      <div style="display:flex;gap:8px">
        <button onclick="printFullInvoice(${JSON.stringify(data).replace(/"/g,'&quot;')})"
          style="padding:7px 14px;background:#3b82f6;color:#fff;border:none;border-radius:7px;cursor:pointer;font-size:13px;font-weight:600">
          🖨️ Print / PDF
        </button>
        <button onclick="document.getElementById('__inv_overlay__').remove()"
          style="padding:7px 14px;background:#475569;color:#fff;border:none;border-radius:7px;cursor:pointer;font-size:13px">
          ✕ Close
        </button>
      </div>
    </div>
    <iframe id="__inv_frame__" style="flex:1;border:none;background:#fff"
      sandbox="allow-same-origin allow-scripts"></iframe>
  `;
  document.body.appendChild(overlay);
  const frame = document.getElementById('__inv_frame__');
  const html = buildInvoiceHtmlFromData(data);
  frame.contentDocument.open();
  frame.contentDocument.write(html);
  frame.contentDocument.close();
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

// ── Print invoice ──────────────────────────────────────────────────────────
function printFullInvoice(data) {
  if (!currentUser) { openLoginModal(); return; }
  if (typeof data === 'string') { try { data = JSON.parse(data); } catch { return; } }
  const html = buildInvoiceHtmlFromData(data);
  const old = document.getElementById('__inv_print_iframe__');
  if (old) old.remove();
  const f = document.createElement('iframe');
  f.id = '__inv_print_iframe__';
  f.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;visibility:hidden;';
  document.body.appendChild(f);
  f.onload = () => {
    setTimeout(() => {
      try { f.contentWindow.focus(); f.contentWindow.print(); } catch {}
      setTimeout(() => f.remove(), 2500);
    }, 600);
  };
  f.contentDocument.open();
  f.contentDocument.write(html);
  f.contentDocument.close();
}

// ── Download verification report ───────────────────────────────────────────
function downloadVerificationReport(data) {
  if (!currentUser) { openLoginModal(); return; }
  if (typeof data === 'string') { try { data = JSON.parse(data); } catch { return; } }
  const isRTL = currentLang === 'ar' || currentLang === 'ku';
  const html = `<!DOCTYPE html>
<html lang="${currentLang}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <title>Verification Report — ${data.invoiceNumber || ''}</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&family=Noto+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', 'Noto Sans Arabic', sans-serif; background: #f8fafc; color: #1e293b; padding: 32px; direction: ${isRTL ? 'rtl' : 'ltr'}; }
    .card { background: white; border-radius: 16px; padding: 32px; max-width: 600px; margin: 0 auto; border: 2px solid #86efac; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .badge { background: #dcfce7; color: #166534; padding: 10px 20px; border-radius: 10px; font-size: 16px; font-weight: 700; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
    .sub { color: #64748b; font-size: 14px; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .field { background: #f8fafc; border-radius: 8px; padding: 12px; }
    .field label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8; display: block; margin-bottom: 4px; }
    .field span { font-size: 14px; font-weight: 700; }
    .inv-num { font-family: monospace; font-size: 12px; background: #e2e8f0; padding: 8px; border-radius: 6px; margin-bottom: 20px; word-break: break-all; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">✓ ${t('result.verified')}</div>
    <h1>${data.invoiceNumber || 'Invoice'}</h1>
    <p class="sub">${t('result.verifiedSub')} <strong>${data.company?.name || 'Loan Management Pro'}</strong></p>
    <div class="inv-num">${data.invoiceNumber || ''}</div>
    <div class="grid">
      <div class="field"><label>${t('result.customer')}</label><span>${data.customer?.name || '—'}</span></div>
      <div class="field"><label>${t('result.type')}</label><span>${getTypeLabel(data.type)}</span></div>
      <div class="field"><label>${t('result.created')}</label><span>${formatDate(data.createdAt)}</span></div>
      <div class="field"><label>${t('result.company')}</label><span>${data.company?.name || 'Loan Management Pro'}</span></div>
    </div>
    <div class="footer">
      Verified on ${new Date().toLocaleString()} via verify.amezona.com<br>
      This report confirms the authenticity of the above invoice.
    </div>
  </div>
  <script>window.addEventListener('load', ()=> setTimeout(()=> window.print(), 600));<\/script>
</body></html>`;

  const win = window.open('', '_blank');
  if (win) { win.document.write(html); win.document.close(); }
}

// ── QR Scanner ─────────────────────────────────────────────────────────────
async function toggleScanner() {
  if (window._scannerRunning) { stopScanner(); } else { startScanner(); }
}

async function startScanner() {
  if (!window.Html5Qrcode) { showToast('QR scanner library not loaded.'); return; }
  try {
    html5QrCode = new Html5Qrcode('qr-reader');
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (decodedText) => {
        let code = decodedText;
        try {
          const url = new URL(decodedText);
          code = url.searchParams.get('code') || url.searchParams.get('invoice') ||
                 url.pathname.split('/').pop() || decodedText;
        } catch { /* not a URL */ }
        stopScanner();
        switchTab('manual');
        const input = document.getElementById('invoiceInput');
        if (input) {
          input.value = code;
          document.getElementById('clearBtn').style.display = 'flex';
        }
        verifyInvoice(code);
      },
      () => { /* frame errors ignored */ }
    );
    window._scannerRunning = true;
    document.getElementById('scanBtnText').textContent = t('verify.stopCamera');
    document.getElementById('scanToggleBtn').style.background = '#dc2626';
  } catch (err) {
    console.error('Scanner error:', err);
    showToast('Could not start camera. Please allow camera access.');
  }
}

function stopScanner() {
  if (html5QrCode && window._scannerRunning) {
    html5QrCode.stop().catch(() => {});
    html5QrCode = null;
  }
  window._scannerRunning = false;
  const btn = document.getElementById('scanToggleBtn');
  if (btn) btn.style.background = '';
  const scanText = document.getElementById('scanBtnText');
  if (scanText) scanText.textContent = t('verify.startCamera');
}

// ── Recent verifications ───────────────────────────────────────────────────
function saveRecentCheck(code, found) {
  try {
    const stored = JSON.parse(localStorage.getItem('recent_verifications') || '[]');
    stored.unshift({ code, found, time: Date.now() });
    localStorage.setItem('recent_verifications', JSON.stringify(stored.slice(0, 5)));
  } catch { /* ignore */ }
}

function renderRecentChecks() {
  try {
    const stored = JSON.parse(localStorage.getItem('recent_verifications') || '[]');
    if (!stored.length) return;
    const container = document.getElementById('recentChecks');
    const list      = document.getElementById('recentList');
    if (!container || !list) return;
    container.style.display = 'block';
    list.innerHTML = stored.map(item => `
      <div class="recent-item" onclick="verifyInvoice('${escapeHtml(item.code)}')">
        <div class="recent-dot ${item.found ? 'ok' : 'err'}"></div>
        <div class="recent-code">${escapeHtml(item.code)}</div>
        <div class="recent-time">${timeAgo(item.time)}</div>
      </div>
    `).join('');
  } catch { /* ignore */ }
}

// ── Utilities ──────────────────────────────────────────────────────────────
function formatDate(val) {
  if (!val) return '—';
  try {
    if (val && typeof val === 'object' && val.seconds) {
      return new Date(val.seconds * 1000).toLocaleDateString(
        currentLang === 'ar' || currentLang === 'ku' ? 'ar-IQ' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
      );
    }
    return new Date(val).toLocaleDateString(
      currentLang === 'ar' || currentLang === 'ku' ? 'ar-IQ' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  } catch { return String(val); }
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = 'block';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.display = 'none'; }, duration);
}
