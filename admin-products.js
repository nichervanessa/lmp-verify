// admin-products.js
// Images are uploaded to GitHub repo: nichervanessa/lmp-verify → gallery/
// Public URL pattern: https://raw.githubusercontent.com/nichervanessa/lmp-verify/main/gallery/FILENAME
// Product metadata (name, price, category, image URLs) saved to Firestore.
// Firebase Storage is NOT used at all.

const GITHUB_OWNER  = 'nichervanessa';
const GITHUB_REPO   = 'lmp-verify';
const GITHUB_BRANCH = 'main';
const GITHUB_FOLDER = 'gallery';
const RAW_BASE      = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${GITHUB_FOLDER}`;

// ─── State ─────────────────────────────────────────────────────────────
let currentUser       = null;
let editingProductId  = null;
let pendingImageFiles = [];   // File objects chosen but not yet uploaded
let uploadedImageURLs = [];   // Raw GitHub URLs already uploaded
let adminFilter       = 'all';

// ─── GitHub token — stored only in the admin's browser localStorage ────
function getToken() { return localStorage.getItem('gh_token') || ''; }
function saveToken(t) { localStorage.setItem('gh_token', t.trim()); }

// ─── Auth gate ─────────────────────────────────────────────────────────
firebase.auth().onAuthStateChanged((user) => {
  document.getElementById('authGate').style.display = 'none';
  if (user) {
    currentUser = user;
    document.getElementById('loginWall').style.display  = 'none';
    document.getElementById('adminUI').style.display    = 'block';
    document.getElementById('adminUserEmail').textContent = user.email;
    // Pre-fill saved token
    const tok = getToken();
    if (tok) document.getElementById('ghTokenInput').value = '••••••••••••••••' + tok.slice(-4);
    loadAdminProducts();
  } else {
    document.getElementById('loginWall').style.display  = 'flex';
    document.getElementById('adminUI').style.display    = 'none';
  }
});

async function adminLogin() {
  const email    = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;
  const errEl    = document.getElementById('adminLoginError');
  const spinner  = document.getElementById('loginSpinner');
  const btnText  = document.getElementById('loginBtnText');
  errEl.style.display = 'none';
  btnText.style.display = 'none';
  spinner.style.display = 'inline-block';
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
  } catch (err) {
    errEl.textContent    = friendlyAuthError(err.code);
    errEl.style.display  = 'block';
    btnText.style.display   = 'inline-block';
    spinner.style.display   = 'none';
  }
}

function friendlyAuthError(code) {
  const map = {
    'auth/wrong-password': 'Incorrect password.',
    'auth/user-not-found': 'No account with that email.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/too-many-requests': 'Too many attempts. Wait a few minutes.',
  };
  return map[code] || 'Sign-in failed. Check your email and password.';
}

function adminLogout() { firebase.auth().signOut(); }

function saveGhToken() {
  const raw = document.getElementById('ghTokenInput').value.trim();
  // If user typed the masked version (starts with bullets), keep existing
  if (!raw || raw.startsWith('•')) return;
  saveToken(raw);
  document.getElementById('ghTokenInput').value = '••••••••••••••••' + raw.slice(-4);
  showToast('GitHub token saved to your browser.');
}

// ─── Image drag-and-drop ───────────────────────────────────────────────
function onDragOver(e) {
  e.preventDefault();
  document.getElementById('dropZone').classList.add('drag-over');
}
function onDragLeave() {
  document.getElementById('dropZone').classList.remove('drag-over');
}
function onDrop(e) {
  e.preventDefault();
  document.getElementById('dropZone').classList.remove('drag-over');
  handleFileSelect(e.dataTransfer.files);
}

function handleFileSelect(files) {
  const already = pendingImageFiles.length + uploadedImageURLs.length;
  for (const file of files) {
    if (!file.type.startsWith('image/')) { alert(`${file.name} is not an image.`); continue; }
    if (file.size > 5 * 1024 * 1024)    { alert(`${file.name} is too large (max 5 MB).`); continue; }
    if (already + pendingImageFiles.length >= 10) break;
    pendingImageFiles.push(file);
  }
  renderImagePreviews();
}

function renderImagePreviews() {
  const grid = document.getElementById('imagePreviewGrid');
  const items = [
    ...uploadedImageURLs.map((url, i) => ({ type: 'uploaded', url, index: i })),
    ...pendingImageFiles.map((file, i) => ({ type: 'pending',  file, index: i })),
  ];
  if (items.length === 0) { grid.innerHTML = ''; return; }

  grid.innerHTML = items.map(item => {
    if (item.type === 'uploaded') {
      return `<div class="admin-img-preview">
        <img src="${escapeHtml(item.url)}" alt="uploaded" />
        <button class="admin-img-remove" onclick="removeUploadedImage(${item.index})">✕</button>
        <span class="admin-img-badge uploaded">✓</span>
      </div>`;
    }
    const objUrl = URL.createObjectURL(item.file);
    return `<div class="admin-img-preview">
      <img src="${objUrl}" alt="${escapeHtml(item.file.name)}" />
      <button class="admin-img-remove" onclick="removePendingImage(${item.index})">✕</button>
      <span class="admin-img-badge pending">⏳</span>
    </div>`;
  }).join('');
}

function removeUploadedImage(index) { uploadedImageURLs.splice(index, 1); renderImagePreviews(); }
function removePendingImage(index)  { pendingImageFiles.splice(index, 1); renderImagePreviews(); }

// ─── Upload one file to GitHub via REST API ────────────────────────────
async function uploadFileToGitHub(file, token, onProgress) {
  // Convert file to base64
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]); // strip data:...;base64,
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Build a unique filename: gallery/timestamp_random.ext
  const ext      = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const path     = `${GITHUB_FOLDER}/${filename}`;
  const apiURL   = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;

  if (onProgress) onProgress('uploading');

  const res = await fetch(apiURL, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json',
      'Accept':        'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      message: `Add product image: ${filename}`,
      content: base64,
      branch:  GITHUB_BRANCH,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    // Useful error messages for common failures
    if (res.status === 401) throw new Error('GitHub token is invalid or expired. Please update it in the Token section above.');
    if (res.status === 403) throw new Error('GitHub token does not have repo write permission. Create a new token with the "Contents: Read and write" permission.');
    if (res.status === 404) throw new Error(`Repository nichervanessa/lmp-verify not found or token has no access.`);
    throw new Error(`GitHub upload failed (${res.status}): ${err.message || res.statusText}`);
  }

  // Return the raw.githubusercontent.com URL (served as a plain CDN)
  return `${RAW_BASE}/${filename}`;
}

// ─── Upload all pending images to GitHub ──────────────────────────────
async function uploadPendingImages() {
  if (pendingImageFiles.length === 0) return;

  const token = getToken();
  if (!token) {
    throw new Error(
      'No GitHub token found. Paste your Personal Access Token in the Token section and click Save.'
    );
  }

  const progressBar = document.getElementById('uploadProgress');
  const fill        = document.getElementById('progressFill');
  const label       = document.getElementById('progressLabel');
  progressBar.style.display = 'block';

  for (let i = 0; i < pendingImageFiles.length; i++) {
    const file = pendingImageFiles[i];
    label.textContent = `Uploading image ${i + 1} of ${pendingImageFiles.length}: ${file.name}`;
    fill.style.width  = `${Math.round((i / pendingImageFiles.length) * 100)}%`;

    const url = await uploadFileToGitHub(file, token, () => {});
    uploadedImageURLs.push(url);
  }

  pendingImageFiles = [];
  fill.style.width  = '100%';
  label.textContent = 'All images uploaded to GitHub ✓';
  setTimeout(() => { progressBar.style.display = 'none'; fill.style.width = '0%'; }, 2000);
}

// ─── Save product ──────────────────────────────────────────────────────
async function saveProduct() {
  const errEl   = document.getElementById('formError');
  const saveBtn = document.getElementById('saveBtn');
  const spinner = document.getElementById('saveSpinner');
  const btnText = document.getElementById('saveBtnText');
  errEl.style.display = 'none';

  const name      = document.getElementById('pName').value.trim();
  const category  = document.querySelector('input[name="pCategory"]:checked')?.value;
  const price     = Number(document.getElementById('pPrice').value);
  const shortDesc = document.getElementById('pShortDesc').value.trim();
  const fullDesc  = document.getElementById('pFullDesc').value.trim();
  const published = document.getElementById('pPublished').checked;

  if (!name)     { showFormError('Product name is required.'); return; }
  if (!category) { showFormError('Please select a category.'); return; }
  if (!price || isNaN(price) || price < 0) { showFormError('Please enter a valid price.'); return; }
  if (uploadedImageURLs.length + pendingImageFiles.length === 0) {
    showFormError('Please add at least one image.'); return;
  }
  if (pendingImageFiles.length > 0 && !getToken()) {
    showFormError('Please add your GitHub token first (see the Token section above).'); return;
  }

  btnText.style.display = 'none';
  spinner.style.display = 'inline-block';
  saveBtn.disabled = true;

  try {
    // 1. Upload any new images to GitHub
    await uploadPendingImages();

    // 2. Generate or reuse product ID
    const productId = editingProductId || db.collection('products').doc().id;
    const isNew     = !editingProductId;

    // 3. Save product metadata to Firestore (image URLs are GitHub raw URLs)
    const data = {
      name, category, price, shortDesc, fullDesc, published,
      images:    uploadedImageURLs,   // array of raw.githubusercontent.com URLs
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    if (isNew) {
      data.createdBy = currentUser.uid;
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    }

    await db.collection('products').doc(productId).set(data, { merge: !isNew });

    resetForm();
    loadAdminProducts();
    showToast(isNew ? '✅ Product saved!' : '✅ Product updated!');
  } catch (err) {
    console.error('Save error:', err);
    if (err.code === 'permission-denied') {
      showFormError('Firestore permission denied. Publish the firestore.rules file in Firebase Console → Firestore → Rules.');
    } else {
      showFormError(err.message);
    }
  } finally {
    btnText.style.display = 'inline-block';
    spinner.style.display = 'none';
    saveBtn.disabled = false;
  }
}

// ─── Reset form ────────────────────────────────────────────────────────
function resetForm() {
  editingProductId  = null;
  pendingImageFiles = [];
  uploadedImageURLs = [];
  document.getElementById('pName').value        = '';
  document.getElementById('pPrice').value       = '';
  document.getElementById('pShortDesc').value   = '';
  document.getElementById('pFullDesc').value    = '';
  document.getElementById('pPublished').checked = true;
  document.querySelector('input[name="pCategory"][value="internet"]').checked = true;
  document.getElementById('imagePreviewGrid').innerHTML = '';
  document.getElementById('formError').style.display   = 'none';
  document.getElementById('formTitle').textContent      = 'Add New Product';
  document.getElementById('saveBtnText').textContent    = 'Save Product';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Load product list ─────────────────────────────────────────────────
async function loadAdminProducts() {
  const loading = document.getElementById('loadingAdminList');
  loading.style.display = 'flex';
  try {
    const snap = await db.collection('products').orderBy('createdAt', 'desc').get();
    const products = [];
    snap.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
    renderAdminList(products);
  } catch (err) {
    console.error('Load error:', err);
    document.getElementById('adminProductList').innerHTML =
      `<p style="color:#ef4444; padding:1rem;">Could not load products: ${escapeHtml(err.message)}</p>`;
  } finally {
    loading.style.display = 'none';
  }
}

let _allAdminProducts = [];

function renderAdminList(products) {
  _allAdminProducts = products;
  filterAdminList(adminFilter);
}

function filterAdminList(cat) {
  adminFilter = cat;
  document.querySelectorAll('.admin-list-filter .cat-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === cat);
  });
  const filtered = cat === 'all' ? _allAdminProducts : _allAdminProducts.filter(p => p.category === cat);
  const list = document.getElementById('adminProductList');

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-loans" style="padding:2rem;border:none;"><p>No products yet.</p></div>`;
    return;
  }

  list.innerHTML = filtered.map(p => `
    <div class="admin-product-row">
      <div class="admin-product-thumb">
        ${p.images && p.images[0]
          ? `<img src="${escapeHtml(p.images[0])}" alt="${escapeHtml(p.name)}" />`
          : `<div class="admin-thumb-placeholder">📦</div>`}
      </div>
      <div class="admin-product-meta">
        <div class="admin-product-name">${escapeHtml(p.name || 'Untitled')}</div>
        <div class="admin-product-info">
          <span class="admin-cat-badge">${p.category || '—'}</span>
          <span>${fmtCurrency(p.price)}</span>
          <span class="admin-status-badge ${p.published ? 'pub' : 'draft'}">${p.published ? '● Live' : '○ Draft'}</span>
          <span>${(p.images || []).length} image(s)</span>
        </div>
      </div>
      <div class="admin-product-actions">
        <button class="ghost-btn" onclick="editProduct('${p.id}')">Edit</button>
        <button class="ghost-btn text-red" onclick="deleteProduct('${p.id}', '${escapeHtml(p.name || '')}')">Delete</button>
      </div>
    </div>
  `).join('');
}

// ─── Edit ──────────────────────────────────────────────────────────────
async function editProduct(productId) {
  try {
    const snap = await db.collection('products').doc(productId).get();
    if (!snap.exists) return;
    const p = snap.data();

    editingProductId  = productId;
    uploadedImageURLs = [...(p.images || [])];
    pendingImageFiles = [];

    document.getElementById('pName').value        = p.name      || '';
    document.getElementById('pPrice').value       = p.price     || '';
    document.getElementById('pShortDesc').value   = p.shortDesc || '';
    document.getElementById('pFullDesc').value    = p.fullDesc  || '';
    document.getElementById('pPublished').checked = p.published !== false;

    const catInput = document.querySelector(`input[name="pCategory"][value="${p.category}"]`);
    if (catInput) catInput.checked = true;

    renderImagePreviews();
    document.getElementById('formTitle').textContent  = 'Edit Product';
    document.getElementById('saveBtnText').textContent = 'Update Product';
    document.getElementById('formError').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    alert('Could not load product: ' + err.message);
  }
}

// ─── Delete ────────────────────────────────────────────────────────────
// Note: images in GitHub are NOT deleted — they stay in the gallery/ folder.
// This is intentional: deleting via API also requires a token + the file SHA,
// and orphaned images on GitHub cost nothing (free storage).
// If you want to clean up, delete them manually in the GitHub web UI.
async function deleteProduct(productId, name) {
  if (!confirm(
    `Delete "${name}"?\n\nThe product will be removed from Firestore.\nImages will remain in the GitHub gallery/ folder (they cost nothing to keep).`
  )) return;
  try {
    await db.collection('products').doc(productId).delete();
    if (editingProductId === productId) resetForm();
    loadAdminProducts();
    showToast('Product deleted from Firestore.');
  } catch (err) {
    alert('Delete failed: ' + err.message);
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────
function fmtCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(amount) || 0);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function showFormError(msg) {
  const el = document.getElementById('formError');
  el.textContent   = msg;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showToast(msg) {
  let toast = document.getElementById('adminToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adminToast';
    toast.className = 'mini-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3500);
}
