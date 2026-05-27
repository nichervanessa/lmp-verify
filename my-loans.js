// my-loans.js — Customer portal: lookup loans by email/phone
// Reads from the public `customerLoans` collection in Firestore.
// The desktop React app must write to that collection
// (see saveLoanForCustomerPortal.js).

// ─── State ─────────────────────────────────────────────────────────────
let activeTab = 'email';
let currentCustomer = null;
let currentLoans = [];

// ─── Tab switching (email vs phone) ────────────────────────────────────
function switchTab(tab) {
  activeTab = tab;
  document.getElementById('tab-email').classList.toggle('active', tab === 'email');
  document.getElementById('tab-phone').classList.toggle('active', tab === 'phone');
  document.getElementById('emailGroup').style.display = tab === 'email' ? 'block' : 'none';
  document.getElementById('phoneGroup').style.display = tab === 'phone' ? 'block' : 'none';
}

// ─── Burger menu (mobile) ──────────────────────────────────────────────
function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

// ─── Normalize phone numbers — strip spaces/dashes/parens ──────────────
function normalizePhone(raw) {
  if (!raw) return '';
  return raw.replace(/[\s\-()]/g, '').replace(/^00/, '+');
}

// ─── Locale-aware currency formatter ───────────────────────────────────
function fmtCurrency(amount) {
  const num = Number(amount) || 0;
  const lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';
  if (lang === 'en') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  }
  return new Intl.NumberFormat('ar-IQ', { style: 'currency', currency: 'IQD', maximumFractionDigits: 0 }).format(num);
}

function fmtDate(d) {
  if (!d) return '—';
  try {
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';
    return new Date(d).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-IQ');
  } catch { return '—'; }
}

// ─── Main lookup ───────────────────────────────────────────────────────
async function lookup(e) {
  e.preventDefault();
  hideAll();
  const btn  = document.getElementById('lookupBtn');
  const text = document.getElementById('lookupBtnText');
  const spin = document.getElementById('lookupSpinner');

  let queryField, queryValue;
  if (activeTab === 'email') {
    queryValue = document.getElementById('emailInput').value.trim().toLowerCase();
    if (!queryValue) return;
    queryField = 'customerEmailLower';
  } else {
    queryValue = normalizePhone(document.getElementById('phoneInput').value);
    if (!queryValue) return;
    queryField = 'customerPhoneNormalized';
  }

  // Loading state
  text.style.display = 'none';
  spin.style.display = 'inline-block';
  btn.disabled = true;
  document.getElementById('loadingCard').style.display = 'flex';

  try {
    const snap = await db.collection('customerLoans')
      .where(queryField, '==', queryValue)
      .get();

    document.getElementById('loadingCard').style.display = 'none';

    if (snap.empty) {
      // Could be legitimately empty OR the collection doesn't exist yet
      // (desktop app hasn't synced any loans). Show the not-found card either way.
      document.getElementById('notFoundCard').style.display = 'block';
      return;
    }

    const loans = [];
    let customerInfo = null;
    snap.forEach(doc => {
      const data = doc.data();
      loans.push({ id: doc.id, ...data });
      if (!customerInfo) {
        customerInfo = {
          name:             data.customerName  || 'Customer',
          email:            data.customerEmail || '',
          phone:            data.customerPhone || '',
          remindersEnabled: !!data.remindersEnabled,
        };
      }
    });

    currentCustomer = customerInfo;
    currentLoans    = loans;
    renderResults();

  } catch (err) {
    document.getElementById('loadingCard').style.display = 'none';
    console.error('Lookup error:', err);

    // Show a specific, helpful message rather than the raw Firebase error
    let msg = '';
    if (err.code === 'permission-denied') {
      msg = 'Access denied. The Firestore security rules have not been published yet. ' +
            'Please paste the firestore.rules file into Firebase Console → Firestore → Rules → Publish.';
    } else if (err.message && err.message.includes('index')) {
      msg = 'Database index not ready. Open the Firebase Console → Firestore → Indexes and wait for the index to finish building (usually 1–2 minutes), then try again.';
    } else {
      msg = 'Lookup failed: ' + (err.message || 'Unknown error.');
    }

    // Show as not-found card with the error text
    const nf = document.getElementById('notFoundCard');
    nf.style.display = 'block';
    // Temporarily override the description text with the real error
    const descEl = nf.querySelector('p');
    if (descEl) descEl.textContent = msg;

  } finally {
    text.style.display = 'inline-block';
    spin.style.display = 'none';
    btn.disabled = false;
  }
}

// ─── Reset to fresh lookup ─────────────────────────────────────────────
function resetLookup() {
  hideAll();
  document.getElementById('lookupCard').style.display = 'block';
  document.getElementById('emailInput').value = '';
  document.getElementById('phoneInput').value = '';
  currentCustomer = null;
  currentLoans = [];
}

function hideAll() {
  document.getElementById('lookupCard').style.display = 'none';
  document.getElementById('notFoundCard').style.display = 'none';
  document.getElementById('loadingCard').style.display = 'none';
  document.getElementById('resultsSection').style.display = 'none';
}

// ─── Render results ────────────────────────────────────────────────────
function renderResults() {
  document.getElementById('resultsSection').style.display = 'block';

  // Header
  document.getElementById('custName').textContent = currentCustomer.name;
  document.getElementById('custInitial').textContent = (currentCustomer.name || '?').charAt(0).toUpperCase();
  document.getElementById('custContact').textContent = currentCustomer.email || currentCustomer.phone || '';

  // Stats
  let totalBorrowed = 0, totalPaid = 0;
  currentLoans.forEach(l => {
    totalBorrowed += Number(l.amount) || 0;
    const paid = (l.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
    totalPaid += paid;
  });
  document.getElementById('statTotal').textContent     = currentLoans.length;
  document.getElementById('statBorrowed').textContent  = fmtCurrency(totalBorrowed);
  document.getElementById('statPaid').textContent      = fmtCurrency(totalPaid);
  document.getElementById('statRemaining').textContent = fmtCurrency(totalBorrowed - totalPaid);

  // Reminder toggle (reflect saved state)
  document.getElementById('reminderToggle').checked = !!currentCustomer.remindersEnabled;

  // Loans list
  const list = document.getElementById('loansList');
  const empty = document.getElementById('emptyLoans');
  if (currentLoans.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = currentLoans.map(renderLoanCard).join('');
}

// Build a single loan card
function renderLoanCard(loan) {
  const totalPaid = (loan.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const amount = Number(loan.amount) || 0;
  const remaining = Math.max(0, amount - totalPaid);
  const progress = amount > 0 ? Math.min(100, (totalPaid / amount) * 100) : 0;

  // Next payment date — if loan has a start date + duration, derive next due
  const nextDue = computeNextDueDate(loan);
  const nextDueLabel = nextDue ? fmtDate(nextDue.toISOString().split('T')[0]) : '—';
  const isOverdue = nextDue && nextDue < new Date() && remaining > 0;

  const status = remaining === 0 ? 'paid'
                : isOverdue ? 'overdue'
                : 'active';

  const statusLabel = t(`myLoans.status_${status}`) ||
                      ({ paid: 'Paid Off', overdue: 'Overdue', active: 'Active' }[status]);

  return `
    <div class="loan-card status-${status}" onclick="showLoanDetail('${loan.id}')">
      <div class="loan-card-head">
        <div>
          <h3 class="loan-card-title">${loan.description || (t('myLoans.loanLabel') || 'Loan')} #${loan.loanCode || (loan.id || '').slice(-6).toUpperCase()}</h3>
          <p class="loan-card-meta">
            ${t('myLoans.borrowed') || 'Borrowed'}: <strong>${fmtCurrency(amount)}</strong>
            ${loan.duration ? ` · ${loan.duration} ${t('myLoans.months') || 'months'}` : ''}
          </p>
        </div>
        <span class="loan-status-badge badge-${status}">${statusLabel}</span>
      </div>

      <div class="loan-card-progress">
        <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
        <div class="progress-text">
          ${fmtCurrency(totalPaid)} ${t('myLoans.of') || 'of'} ${fmtCurrency(amount)} <span style="color:#94a3b8">(${progress.toFixed(0)}%)</span>
        </div>
      </div>

      <div class="loan-card-foot">
        <div class="loan-card-stat">
          <span class="lc-stat-label">${t('myLoans.remaining') || 'Remaining'}</span>
          <span class="lc-stat-value">${fmtCurrency(remaining)}</span>
        </div>
        <div class="loan-card-stat">
          <span class="lc-stat-label">${t('myLoans.nextDue') || 'Next Due'}</span>
          <span class="lc-stat-value ${isOverdue ? 'text-red' : ''}">${nextDueLabel}</span>
        </div>
        <div class="loan-card-stat">
          <span class="lc-stat-label">${t('myLoans.payments') || 'Payments'}</span>
          <span class="lc-stat-value">${(loan.payments || []).length}</span>
        </div>
      </div>
    </div>
  `;
}

// ─── Compute next due date based on payments made vs schedule ──────────
function computeNextDueDate(loan) {
  if (!loan.startDate || !loan.duration) return null;
  const start = new Date(loan.startDate);
  if (isNaN(start.getTime())) return null;

  const paidCount = (loan.payments || []).length;
  // Next due = start + (paidCount + 1) months
  const next = new Date(start);
  next.setMonth(start.getMonth() + paidCount + 1);
  return next;
}

// ─── Detail modal ──────────────────────────────────────────────────────
function showLoanDetail(loanId) {
  const loan = currentLoans.find(l => l.id === loanId);
  if (!loan) return;

  const totalPaid = (loan.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const amount    = Number(loan.amount) || 0;
  const remaining = Math.max(0, amount - totalPaid);
  const monthly   = loan.monthlyPayment || (loan.duration ? amount / loan.duration : 0);

  document.getElementById('detailLoanTitle').textContent =
    `${loan.description || (t('myLoans.loanLabel') || 'Loan')} #${loan.loanCode || (loan.id || '').slice(-6).toUpperCase()}`;
  document.getElementById('detailLoanSubtitle').textContent =
    `${t('myLoans.created') || 'Created'}: ${fmtDate(loan.startDate)}`;

  document.getElementById('detailAmount').textContent    = fmtCurrency(amount);
  document.getElementById('detailPaid').textContent      = fmtCurrency(totalPaid);
  document.getElementById('detailRemaining').textContent = fmtCurrency(remaining);
  document.getElementById('detailMonthly').textContent   = fmtCurrency(monthly);

  // Payment history
  const payments = (loan.payments || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  document.getElementById('detailPayments').innerHTML = payments.length === 0
    ? `<p class="muted-text">${t('myLoans.noPayments') || 'No payments yet.'}</p>`
    : payments.map((p, i) => `
      <div class="payment-row">
        <div class="payment-num">#${payments.length - i}</div>
        <div class="payment-info">
          <div class="payment-amount">${fmtCurrency(p.amount)}</div>
          <div class="payment-date">${fmtDate(p.date)}</div>
        </div>
      </div>
    `).join('');

  // Upcoming payments — derive schedule
  const upcoming = computeUpcomingPayments(loan, totalPaid);
  document.getElementById('detailUpcoming').innerHTML = upcoming.length === 0
    ? `<p class="muted-text">${t('myLoans.allPaid') || 'All payments completed.'}</p>`
    : upcoming.map(p => `
      <div class="payment-row ${p.overdue ? 'overdue' : ''}">
        <div class="payment-num">#${p.num}</div>
        <div class="payment-info">
          <div class="payment-amount">${fmtCurrency(p.amount)}</div>
          <div class="payment-date">${fmtDate(p.date)}${p.overdue ? ` · <span class="text-red">${t('myLoans.overdueLabel') || 'OVERDUE'}</span>` : ''}</div>
        </div>
      </div>
    `).join('');

  document.getElementById('loanDetailModal').classList.add('open');
}

function closeLoanDetail() {
  document.getElementById('loanDetailModal').classList.remove('open');
}

function computeUpcomingPayments(loan, totalPaid) {
  const list = [];
  if (!loan.startDate || !loan.duration) return list;
  const start = new Date(loan.startDate);
  if (isNaN(start.getTime())) return list;
  const monthly = loan.monthlyPayment || (loan.amount / loan.duration);
  const paidCount = (loan.payments || []).length;
  const today = new Date();

  for (let i = paidCount + 1; i <= loan.duration; i++) {
    const due = new Date(start);
    due.setMonth(start.getMonth() + i);
    list.push({
      num: i,
      amount: monthly,
      date: due.toISOString().split('T')[0],
      overdue: due < today,
    });
  }
  // Show first 6 upcoming
  return list.slice(0, 6);
}

// ─── Toggle email reminders ────────────────────────────────────────────
async function toggleReminders(enabled) {
  if (!currentCustomer || !currentLoans.length) return;
  try {
    // Update the flag on all loan docs belonging to this customer
    const batch = db.batch();
    currentLoans.forEach(l => {
      batch.update(db.collection('customerLoans').doc(l.id), { remindersEnabled: enabled });
    });
    await batch.commit();
    currentCustomer.remindersEnabled = enabled;
    // Tiny toast
    const msg = enabled
      ? (t('myLoans.remindersOn') || 'Email reminders enabled.')
      : (t('myLoans.remindersOff') || 'Email reminders disabled.');
    showToast(msg);
  } catch (e) {
    console.error(e);
    showToast(t('myLoans.reminderError') || 'Could not save preference.');
    document.getElementById('reminderToggle').checked = !enabled;
  }
}

// ─── Mini toast ────────────────────────────────────────────────────────
function showToast(msg) {
  let toast = document.getElementById('miniToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'miniToast';
    toast.className = 'mini-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── Print statement ───────────────────────────────────────────────────
function printStatement() {
  window.print();
}

// ─── Close modal on outside click ──────────────────────────────────────
document.addEventListener('click', (e) => {
  if (e.target.id === 'loanDetailModal') closeLoanDetail();
});
