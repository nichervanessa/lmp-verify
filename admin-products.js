// admin-products.js — Auth-gated product management
// Handles: Firebase Auth gate, drag-and-drop image upload to Firebase Storage,
// Firestore create/update/delete for products collection.

const storage = firebase.storage();

// ─── State ─────────────────────────────────────────────────────────────
let currentUser      = null;
let editingProductId = null;
let pendingImageFiles = [];   // File objects waiting to upload
let uploadedImageURLs = [];   // Already-uploaded URLs (for edits or completed uploads)
let adminFilter = 'all';

// ─── Auth gate ─────────────────────────────────────────────────────────
firebase.auth().onAuthStateChanged((user) => {
  document.getElementById('authGate').style.display = 'none';
  if (user) {
    currentUser = user;
    document.getElementById('loginWall').style.display  = 'none';
    document.getElementById('adminUI').style.display    = 'block';
    document.getElementById('adminUserEmail').textContent = user.email;
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
    errEl.textContent    = err.message;
    errEl.style.display  = 'block';
    btnText.style.display   = 'inline-block';
    spinner.style.display   = 'none';
  }
}

function adminLogout() {
  firebase.auth().signOut();
}

// ─── Image drag-and-drop ───────────────────────────────────────────────
function onDragOver(e) {
  e.preventDefault();
  document.getElementById('dropZone').classList.add('drag-over');
}

function onDragLeave(e) {
  document.getElementById('dropZone').classList.remove('drag-over');
}

function onDrop(e) {
  e.preventDefault();
  document.getElementById('dropZone').classList.remove('drag-over');
  handleFileSelect(e.dataTransfer.files);
}

function handleFileSelect(files) {
  const total = pendingImageFiles.length + uploadedImageURLs.length;
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name} is too large (max 5 MB).`);
      continue;
    }
    if (total + pendingImageFiles.length >= 10) break;
    pendingImageFiles.push(file);
  }
  renderImagePreviews();
}

function renderImagePreviews() {
  const grid = document.getElementById('imagePreviewGrid');
  const urls = [
    ...uploadedImageURLs.map((url, i) => ({ type: 'uploaded', url, index: i })),
    ...pendingImageFiles.map((file, i) => ({ type: 'pending', file, index: i })),
  ];

  if (urls.length === 0) {
    grid.innerHTML = '';
    return;
  }

  grid.innerHTML = urls.map(item => {
    if (item.type === 'uploaded') {
      return `<div class="admin-img-preview">
        <img src="${escapeHtml(item.url)}" alt="Product image" />
        <button class="admin-img-remove" onclick="removeUploadedImage(${item.index})" title="Remove">✕</button>
        <span class="admin-img-badge uploaded">✓</span>
      </div>`;
    } else {
      const objUrl = URL.createObjectURL(item.file);
      return `<div class="admin-img-preview" id="pending-${item.index}">
        <img src="${objUrl}" alt="${escapeHtml(item.file.name)}" />
        <button class="admin-img-remove" onclick="removePendingImage(${item.index})" title="Remove">✕</button>
        <span class="admin-img-badge pending">⏳</span>
      </div>`;
    }
  }).join('');
}

function removeUploadedImage(index) {
  uploadedImageURLs.splice(index, 1);
  renderImagePreviews();
}

function removePendingImage(index) {
  pendingImageFiles.splice(index, 1);
  renderImagePreviews();
}

// ─── Upload all pending images to Firebase Storage ─────────────────────
async function uploadPendingImages(productId) {
  if (pendingImageFiles.length === 0) return;

  const progressBar   = document.getElementById('uploadProgress');
  const fill          = document.getElementById('progressFill');
  const label         = document.getElementById('progressLabel');
  progressBar.style.display = 'block';

  for (let i = 0; i < pendingImageFiles.length; i++) {
    const file     = pendingImageFiles[i];
    const ext      = file.name.split('.').pop() || 'jpg';
    const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const ref      = storage.ref(`products/${productId}/${filename}`);

    label.textContent = `Uploading ${i + 1} of ${pendingImageFiles.length}…`;

    await new Promise((resolve, reject) => {
      const task = ref.put(file);
      task.on('state_changed',
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          fill.style.width = `${Math.round(((i / pendingImageFiles.length) * 100) + pct / pendingImageFiles.length)}%`;
        },
        reject,
        async () => {
          const url = await task.snapshot.ref.getDownloadURL();
          uploadedImageURLs.push(url);
          resolve();
        }
      );
    });
  }

  pendingImageFiles = [];
  fill.style.width  = '100%';
  label.textContent = 'Upload complete!';
  setTimeout(() => { progressBar.style.display = 'none'; fill.style.width = '0%'; }, 1200);
}

// ─── Save product (create or update) ──────────────────────────────────
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
  if (!price || isNaN(price) || price < 0) {
    showFormError('Please enter a valid price.'); return;
  }
  if (uploadedImageURLs.length + pendingImageFiles.length === 0) {
    showFormError('Please add at least one image.'); return;
  }

  btnText.style.display = 'none';
  spinner.style.display = 'inline-block';
  saveBtn.disabled = true;

  try {
    // Generate a stable product ID upfront (or reuse the existing one when editing).
    // This lets us use the ID as the Storage path BEFORE the Firestore doc exists,
    // avoiding the two-step add-then-set pattern that caused permission errors.
    const productId = editingProductId
      || db.collection('products').doc().id;   // client-side auto-ID

    // Upload images first (needs productId for the Storage path)
    await uploadPendingImages(productId);

    // Single atomic write — create or overwrite
    const isNew = !editingProductId;
    const data  = {
      name, category, price, shortDesc, fullDesc, published,
      images:    uploadedImageURLs,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    if (isNew) {
      data.createdBy = currentUser.uid;
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    }

    // set() with merge:false for new docs, merge:true for edits so we
    // don't accidentally wipe fields we're not editing.
    await db.collection('products').doc(productId).set(data, { merge: !isNew });

    resetForm();
    loadAdminProducts();
    showToast(editingProductId ? 'Product updated.' : 'Product saved!');
  } catch (err) {
    console.error('Save error:', err);
    // Give a helpful hint if it's still a permissions error
    if (err.code === 'permission-denied') {
      showFormError(
        'Permission denied. Make sure you have published the Firestore rules ' +
        'from the firestore.rules file in Firebase Console → Firestore → Rules.'
      );
    } else {
      showFormError('Save failed: ' + err.message);
    }
  } finally {
    btnText.style.display = 'inline-block';
    spinner.style.display = 'none';
    saveBtn.disabled = false;
  }
}

function showFormError(msg) {
  const el = document.getElementById('formError');
  el.textContent  = msg;
  el.style.display = 'block';
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─── Reset form ────────────────────────────────────────────────────────
function resetForm() {
  editingProductId  = null;
  pendingImageFiles = [];
  uploadedImageURLs = [];
  document.getElementById('pName').value      = '';
  document.getElementById('pPrice').value     = '';
  document.getElementById('pShortDesc').value = '';
  document.getElementById('pFullDesc').value  = '';
  document.getElementById('pPublished').checked = true;
  document.querySelector('input[name="pCategory"][value="internet"]').checked = true;
  document.getElementById('imagePreviewGrid').innerHTML = '';
  document.getElementById('formError').style.display = 'none';
  document.getElementById('formTitle').textContent = 'Add New Product';
  document.getElementById('saveBtnText').textContent = 'Save Product';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── Load admin product list ───────────────────────────────────────────
async function loadAdminProducts() {
  const loading = document.getElementById('loadingAdminList');
  loading.style.display = 'flex';
  try {
    const snap = await db.collection('products')
      .orderBy('createdAt', 'desc')
      .get();
    const products = [];
    snap.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
    renderAdminList(products);
  } catch (err) {
    console.error(err);
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
    list.innerHTML = `<div class="empty-loans" style="padding:2rem; border:none;"><p>No products yet.</p></div>`;
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
          <span>${(p.images || []).length} img</span>
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
    const doc = await db.collection('products').doc(productId).get();
    if (!doc.exists) return;
    const p = doc.data();

    editingProductId = productId;
    uploadedImageURLs = [...(p.images || [])];
    pendingImageFiles = [];

    document.getElementById('pName').value      = p.name || '';
    document.getElementById('pPrice').value     = p.price || '';
    document.getElementById('pShortDesc').value = p.shortDesc || '';
    document.getElementById('pFullDesc').value  = p.fullDesc || '';
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
async function deleteProduct(productId, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone. Images in Storage will also be removed.`)) return;
  try {
    // Delete Firestore doc
    await db.collection('products').doc(productId).delete();
    // Attempt to delete Storage files (best-effort)
    try {
      const listRef = storage.ref(`products/${productId}`);
      const list    = await listRef.listAll();
      await Promise.all(list.items.map(ref => ref.delete()));
    } catch (storageErr) {
      console.warn('Could not delete storage files:', storageErr.message);
    }
    loadAdminProducts();
    showToast('Product deleted.');
  } catch (err) {
    alert('Delete failed: ' + err.message);
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────
function fmtCurrency(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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
  toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
}
