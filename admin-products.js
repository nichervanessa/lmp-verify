// admin-products.js
// Images are uploaded to ImgBB (free image hosting — no Firebase Storage needed).
// Product metadata (name, price, category, image URLs) saved to Firestore.
//
// ── HOW TO SET UP ImgBB (one-time, 2 minutes) ────────────────────────────────
//  1. Go to https://imgbb.com  →  Create a FREE account
//  2. Go to https://api.imgbb.com  →  click "Get API key"
//  3. Copy your API key and paste it into the Config section in the Admin UI.
// ─────────────────────────────────────────────────────────────────────────────

// ─── State ─────────────────────────────────────────────────────────────
let currentUser       = null;
let editingProductId  = null;
let pendingImageFiles = [];   // File objects chosen but not yet uploaded
let uploadedImageURLs = [];   // ImgBB URLs already uploaded
let adminFilter       = 'all';

// ─── ImgBB config — stored in browser localStorage ────────────────────
function getImgBBKey() {
  return localStorage.getItem('imgbb_api_key') || '';
}
function saveImgBBKey(key) {
  localStorage.setItem('imgbb_api_key', key.trim());
}

function saveImgBBConfig() {
  const key = document.getElementById('imgbbApiKey').value.trim();
  if (!key) { showToast('⚠️ Please enter your ImgBB API key.'); return; }
  saveImgBBKey(key);
  maskConfigInputs();
  showToast('✅ ImgBB config saved!');
}

function maskConfigInputs() {
  const key = getImgBBKey();
  if (key) {
    const el = document.getElementById('imgbbApiKey');
    if (el) el.value = key;
  }
}

// ─── Auth gate ─────────────────────────────────────────────────────────
firebase.auth().onAuthStateChanged((user) => {
  document.getElementById('authGate').style.display = 'none';
  if (user) {
    currentUser = user;
    document.getElementById('loginWall').style.display = 'none';
    document.getElementById('adminUI').style.display   = 'block';
    document.getElementById('adminUserEmail').textContent = user.email;
    maskConfigInputs();
    loadAdminProducts();
  } else {
    document.getElementById('loginWall').style.display = 'flex';
    document.getElementById('adminUI').style.display   = 'none';
  }
});

async function adminLogin() {
  const email    = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;
  const errEl    = document.getElementById('adminLoginError');
  const spinner  = document.getElementById('loginSpinner');
  const btnText  = document.getElementById('loginBtnText');
  errEl.style.display   = 'none';
  btnText.style.display = 'none';
  spinner.style.display = 'inline-block';
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
  } catch (err) {
    errEl.textContent     = friendlyAuthError(err.code);
    errEl.style.display   = 'block';
    btnText.style.display = 'inline-block';
    spinner.style.display = 'none';
  }
}

function friendlyAuthError(code) {
  const map = {
    'auth/wrong-password':     'Incorrect password.',
    'auth/user-not-found':     'No account with that email.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/too-many-requests':  'Too many attempts. Wait a few minutes.',
  };
  return map[code] || 'Sign-in failed. Check your email and password.';
}

function adminLogout() { firebase.auth().signOut(); }

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
    if (!file.type.startsWith('image/')) { showToast('⚠️ ' + file.name + ' is not an image.'); continue; }
    if (file.size > 10 * 1024 * 1024)   { showToast('⚠️ ' + file.name + ' exceeds 10 MB.'); continue; }
    if (already + pendingImageFiles.length >= 10) break;
    pendingImageFiles.push(file);
  }
  renderImagePreviews();
}

function renderImagePreviews() {
  const grid = document.getElementById('imagePreviewGrid');
  const items = [
    ...uploadedImageURLs.map((url, i) => ({ type: 'uploaded', url, index: i })),
    ...pendingImageFiles.map((file, i) => ({ type: 'pending', file, index: i })),
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

// ─── Upload one image to ImgBB ────────────────────────────────────────
function uploadImageToImgBB(file, onProgress) {
  const key = getImgBBKey();

  if (!key) {
    return Promise.reject(new Error(
      'ImgBB is not configured. Please enter your API key in the Config section above and click Save.'
    ));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // ImgBB expects base64 without the data:image/...;base64, prefix
      const base64 = reader.result.split(',')[1];

      const formData = new FormData();
      formData.append('key', key);
      formData.append('image', base64);
      formData.append('name', file.name.replace(/\.[^.]+$/, ''));

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
              // Use display_url — direct image link, no HTML wrapper page
              resolve(data.data.display_url);
            } else {
              reject(new Error(data.error?.message || 'ImgBB upload failed.'));
            }
          } catch {
            reject(new Error('Could not parse ImgBB response.'));
          }
        } else {
          let msg = `Upload failed (${xhr.status}).`;
          try {
            const err = JSON.parse(xhr.responseText);
            if (err.error?.message) msg += ' ' + err.error.message;
          } catch {}
          reject(new Error(msg));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Network error during upload. Check your internet connection.')));
      xhr.addEventListener('abort', () => reject(new Error('Upload was cancelled.')));

      xhr.open('POST', 'https://api.imgbb.com/1/upload');
      xhr.send(formData);
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsDataURL(file);
  });
}

// ─── Upload all pending images ─────────────────────────────────────────
async function uploadPendingImages() {
  if (pendingImageFiles.length === 0) return;

  const progressBar = document.getElementById('uploadProgress');
  const fill        = document.getElementById('progressFill');
  const label       = document.getElementById('progressLabel');
  progressBar.style.display = 'block';

  for (let i = 0; i < pendingImageFiles.length; i++) {
    const file = pendingImageFiles[i];
    label.textContent = `Uploading image ${i + 1} of ${pendingImageFiles.length}: ${file.name}`;

    const url = await uploadImageToImgBB(file, (pct) => {
      const overall = Math.round(((i + pct / 100) / pendingImageFiles.length) * 100);
      fill.style.width = overall + '%';
    });
    uploadedImageURLs.push(url);
  }

  pendingImageFiles = [];
  fill.style.width  = '100%';
  label.textContent = 'All images uploaded ✓';
  setTimeout(() => { progressBar.style.display = 'none'; fill.style.width = '0%'; }, 2000);
}

// ─── Save product to Firestore ─────────────────────────────────────────
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

  btnText.style.display = 'none';
  spinner.style.display = 'inline-block';
  saveBtn.disabled = true;

  try {
    // 1. Upload images to ImgBB
    await uploadPendingImages();

    // 2. Save product metadata to Firestore
    const productId = editingProductId || db.collection('products').doc().id;
    const isNew     = !editingProductId;

    const data = {
      name, category, price, shortDesc, fullDesc, published,
      images:    uploadedImageURLs,
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
      showFormError('Firestore permission denied. Publish the firestore.rules in Firebase Console → Firestore → Rules.');
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
  document.getElementById('imagePreviewGrid').innerHTML  = '';
  document.getElementById('formError').style.display     = 'none';
  document.getElementById('formTitle').textContent       = t('admin.formTitleAdd') || 'Add New Product';
  document.getElementById('saveBtnText').textContent     = t('admin.saveProduct')  || 'Save Product';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Load products ─────────────────────────────────────────────────────
async function loadAdminProducts() {
  const loading = document.getElementById('loadingAdminList');
  loading.style.display = 'flex';
  try {
    const snap = await db.collection('products').get();
    const products = [];
    snap.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
    // Sort newest first in JS (avoids needing a Firestore composite index)
    products.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() || 0;
      const tb = b.createdAt?.toMillis?.() || 0;
      return tb - ta;
    });
    renderAdminList(products);
  } catch (err) {
    console.error('Load error:', err);
    document.getElementById('adminProductList').innerHTML =
      `<p style="color:#ef4444;padding:1rem;">Could not load products: ${escapeHtml(err.message)}</p>`;
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
    list.innerHTML = `<div class="empty-loans" style="padding:2rem;border:none;"><p>${t('admin.noProducts') || 'No products yet.'}</p></div>`;
    return;
  }

  list.innerHTML = filtered.map(p => `
    <div class="admin-product-row">
      <div class="admin-product-thumb">
        ${p.images?.[0]
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
        <button class="ghost-btn" onclick="editProduct('${p.id}')">${t('admin.editBtn') || 'Edit'}</button>
        <button class="ghost-btn text-red" onclick="deleteProduct('${p.id}', '${escapeHtml(p.name || '')}')">${t('admin.deleteBtn') || 'Delete'}</button>
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
    document.getElementById('formTitle').textContent   = t('admin.formTitleEdit') || 'Edit Product';
    document.getElementById('saveBtnText').textContent = t('admin.updateProduct') || 'Update Product';
    document.getElementById('formError').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    alert('Could not load product: ' + err.message);
  }
}

// ─── Delete ────────────────────────────────────────────────────────────
async function deleteProduct(productId, name) {
  if (!confirm(`Delete "${name}"?\n\nThe product will be removed from Firestore.\nImages on ImgBB will remain (you can remove them from your ImgBB account if needed).`)) return;
  try {
    await db.collection('products').doc(productId).delete();
    if (editingProductId === productId) resetForm();
    loadAdminProducts();
    showToast('Product deleted.');
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
