// product-detail.js — loads a single product by ?id= and drives the slideshow

let currentSlide = 0;
let totalSlides   = 0;

function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

function fmtCurrency(amount) {
  const num  = Number(amount) || 0;
  const lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';
  if (lang === 'en') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  }
  return new Intl.NumberFormat('ar-IQ', { style: 'currency', currency: 'IQD', maximumFractionDigits: 0 }).format(num);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── Load product from Firestore ──────────────────────────────────────────
async function loadProduct() {
  const params    = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) { showNotFound(); return; }

  try {
    const doc = await db.collection('products').doc(productId).get();
    if (!doc.exists || doc.data().published === false) { showNotFound(); return; }

    document.getElementById('loadingDetail').style.display = 'none';
    renderProduct({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('Could not load product:', err);
    showNotFound();
  }
}

function showNotFound() {
  document.getElementById('loadingDetail').style.display  = 'none';
  document.getElementById('detailNotFound').style.display = 'block';
}

// ─── Render ───────────────────────────────────────────────────────────────
function renderProduct(p) {
  document.title = `${p.name || 'Product'} — Loan Management Pro`;

  const images = p.images || [];
  totalSlides   = images.length;

  // Category badge
  const catLabels = { internet: 'Internet', solar: 'Solar', camera: 'Camera' };
  document.getElementById('detailCategory').textContent = catLabels[p.category] || p.category || '';

  document.getElementById('detailName').textContent  = p.name || '';
  document.getElementById('detailShort').textContent = p.shortDesc || '';
  document.getElementById('detailPrice').textContent = fmtCurrency(p.price);

  // Full description (preserve line breaks)
  const fullEl = document.getElementById('detailFull');
  if (p.fullDesc) {
    fullEl.innerHTML = escapeHtml(p.fullDesc).replace(/\n/g, '<br>');
    fullEl.style.display = 'block';
  } else {
    fullEl.style.display = 'none';
  }

  // Main slideshow images
  const slidesEl = document.getElementById('detailSlides');
  if (images.length === 0) {
    slidesEl.innerHTML = `
      <div class="detail-slide placeholder-slide">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>`;
    document.getElementById('detailPrev').style.display = 'none';
    document.getElementById('detailNext').style.display = 'none';
    document.getElementById('detailImgCount').style.display = 'none';
  } else {
    slidesEl.innerHTML = images
      .map((src, i) => `<img class="detail-slide${i === 0 ? ' active' : ''}" src="${escapeHtml(src)}" alt="${escapeHtml(p.name || 'Product')} ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}" />`)
      .join('');
    updateCounter();
    if (images.length === 1) {
      document.getElementById('detailPrev').style.display = 'none';
      document.getElementById('detailNext').style.display = 'none';
    }
  }

  // Thumbnails
  const thumbsEl = document.getElementById('detailThumbs');
  if (images.length > 1) {
    thumbsEl.innerHTML = images
      .map((src, i) => `<img class="detail-thumb${i === 0 ? ' active' : ''}" src="${escapeHtml(src)}" alt="Thumbnail ${i + 1}" onclick="goToSlide(${i})" loading="lazy" />`)
      .join('');
    thumbsEl.style.display = 'flex';
  } else {
    thumbsEl.style.display = 'none';
  }

  document.getElementById('productDetail').style.display = 'block';

  // Keyboard arrow navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  slidePrev();
    if (e.key === 'ArrowRight') slideNext();
  });

  // Touch swipe
  let touchStartX = 0;
  slidesEl.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slidesEl.addEventListener('touchend',   (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? slideNext() : slidePrev(); }
  });
}

// ─── Slide navigation ─────────────────────────────────────────────────────
function goToSlide(index) {
  if (totalSlides === 0) return;
  currentSlide = ((index % totalSlides) + totalSlides) % totalSlides;

  document.querySelectorAll('.detail-slide').forEach((img, i) => {
    img.classList.toggle('active', i === currentSlide);
  });
  document.querySelectorAll('.detail-thumb').forEach((img, i) => {
    img.classList.toggle('active', i === currentSlide);
    if (i === currentSlide) img.scrollIntoView({ inline: 'nearest', behavior: 'smooth' });
  });
  updateCounter();
}

function slideNext() { goToSlide(currentSlide + 1); }
function slidePrev() { goToSlide(currentSlide - 1); }

function updateCounter() {
  document.getElementById('detailImgCount').textContent = `${currentSlide + 1} / ${totalSlides}`;
}

document.addEventListener('DOMContentLoaded', loadProduct);
