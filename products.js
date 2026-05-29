// products.js — Public product catalog with image slideshows per card
// Reads from the `products` collection in Firestore.

let activeCategory = 'internet';
let allProducts = {};  // cached by category

// Burger menu
function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

// Show admin link if user is logged in
firebase.auth().onAuthStateChanged((user) => {
  document.getElementById('adminLink').style.display = user ? 'inline-flex' : 'none';
});

// ─── Currency formatter ──────────────────────────────────────────────
function fmtCurrency(amount) {
  const num = Number(amount) || 0;
  const lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';
  if (lang === 'en') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  }
  return new Intl.NumberFormat('ar-IQ', { style: 'currency', currency: 'IQD', maximumFractionDigits: 0 }).format(num);
}

// ─── Switch category tab ─────────────────────────────────────────────
function switchCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.cat-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === cat);
  });
  // Auto-scroll category into view on mobile
  document.querySelector(`.cat-tab[data-cat="${cat}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  renderProducts();
}

// ─── Load products from Firestore ────────────────────────────────────
async function loadProducts() {
  const loading = document.getElementById('loadingProducts');
  loading.style.display = 'flex';
  try {
    const snap = await db.collection('products')
      .where('published', '==', true)
      .get();

    // Group by category, sort newest first in JS (avoids needing a Firestore composite index)
    const grouped = { internet: [], solar: [], camera: [] };
    snap.forEach(doc => {
      const p = { id: doc.id, ...doc.data() };
      if (grouped[p.category]) grouped[p.category].push(p);
    });
    Object.keys(grouped).forEach(cat => {
      grouped[cat].sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() || 0;
        const tb = b.createdAt?.toMillis?.() || 0;
        return tb - ta;
      });
    });
    allProducts = grouped;
    loading.style.display = 'none';
    renderProducts();
  } catch (err) {
    console.error('Could not load products:', err);
    loading.style.display = 'none';
    document.getElementById('emptyProducts').style.display = 'block';
  }
}

// ─── Render product grid for active category ─────────────────────────
function renderProducts() {
  const list = allProducts[activeCategory] || [];
  const grid = document.getElementById('productsGrid');
  const empty = document.getElementById('emptyProducts');

  if (list.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  grid.innerHTML = list.map(productCard).join('');

  // Init image sliders on all cards
  list.forEach(p => initSlider(p.id, (p.images || []).length));
}

// ─── Single product card with image slider ───────────────────────────
function productCard(p) {
  const images = p.images || [];
  const hasMulti = images.length > 1;
  const firstImg = images[0] || '';

  const slides = images.length === 0
    ? `<div class="product-img placeholder"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>`
    : images.map((src, i) => `<img class="product-img ${i === 0 ? 'active' : ''}" data-slide="${i}" src="${escapeHtml(src)}" alt="${escapeHtml(p.name || 'Product')}" loading="lazy" />`).join('');

  const dots = hasMulti
    ? `<div class="slider-dots" id="dots-${p.id}">
        ${images.map((_, i) => `<button class="slider-dot ${i === 0 ? 'active' : ''}" onclick="goToSlide('${p.id}', ${i})" aria-label="Slide ${i + 1}"></button>`).join('')}
      </div>`
    : '';

  const arrows = hasMulti
    ? `<button class="slider-arrow slider-prev" onclick="event.stopPropagation(); slidePrev('${p.id}')">‹</button>
       <button class="slider-arrow slider-next" onclick="event.stopPropagation(); slideNext('${p.id}')">›</button>`
    : '';

  return `
    <article class="product-card" onclick="viewProduct('${p.id}')">
      <div class="product-images" id="slider-${p.id}" data-product="${p.id}">
        ${slides}
        ${arrows}
        ${dots}
        ${images.length > 0 ? `<span class="product-img-count">${images.length}</span>` : ''}
      </div>
      <div class="product-body">
        <h3 class="product-name">${escapeHtml(p.name || 'Untitled')}</h3>
        ${p.shortDesc ? `<p class="product-desc">${escapeHtml(p.shortDesc)}</p>` : ''}
        <div class="product-foot">
          <span class="product-price">${fmtCurrency(p.price)}</span>
          <span class="product-view">
            <span data-i18n="products.viewDetails">View</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
        </div>
      </div>
    </article>
  `;
}

// ─── Image slider state per product ──────────────────────────────────
const sliderState = {}; // { productId: { current, total } }

function initSlider(productId, total) {
  sliderState[productId] = { current: 0, total };
  // Auto-rotate every 4s
  if (total > 1) {
    setInterval(() => {
      const slider = document.getElementById(`slider-${productId}`);
      // Only auto-rotate if user isn't hovering (basic UX)
      if (slider && !slider.matches(':hover')) slideNext(productId);
    }, 4000);
  }
}

function goToSlide(productId, index) {
  event?.stopPropagation();
  const slider = document.getElementById(`slider-${productId}`);
  if (!slider) return;
  const st = sliderState[productId];
  if (!st) return;
  st.current = index % st.total;
  slider.querySelectorAll('img').forEach(img => {
    img.classList.toggle('active', Number(img.dataset.slide) === st.current);
  });
  const dots = document.getElementById(`dots-${productId}`);
  if (dots) dots.querySelectorAll('.slider-dot').forEach((d, i) => d.classList.toggle('active', i === st.current));
}

function slideNext(productId) {
  const st = sliderState[productId];
  if (!st) return;
  goToSlide(productId, (st.current + 1) % st.total);
}

function slidePrev(productId) {
  const st = sliderState[productId];
  if (!st) return;
  goToSlide(productId, (st.current - 1 + st.total) % st.total);
}

// ─── View product detail ─────────────────────────────────────────────
function viewProduct(productId) {
  window.location.href = `product-detail.html?id=${encodeURIComponent(productId)}`;
}

// ─── HTML escaping (safety) ──────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── Start ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  // Allow URL ?cat=solar to deep-link to category
  const params = new URLSearchParams(window.location.search);
  const startCat = params.get('cat');
  if (startCat && ['internet', 'solar', 'camera'].includes(startCat)) {
    switchCategory(startCat);
  }
});
