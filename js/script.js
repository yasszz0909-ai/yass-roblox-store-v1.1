// ==========================================
// KONFIGURASI UTAMA YASS ROBLOX STORE
// ==========================================
const WA_NUMBER = "6283898578903";
let selectedProduct = null;
let currentCategory = "Semua";

// --- 1. FUNGSI PEMBUAT SLUG OTOMATIS ---
// Mengubah "Robot Kraken" menjadi "robot-kraken" untuk URL
function createSlug(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '') 
        .replace(/\s+/g, '-')       
        .replace(/-+/g, '-');       
}

// --- 2. TEMA & NOTIFIKASI (TOAST) ---
function applyTheme() {
    const savedTheme = localStorage.getItem('yass_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('yass_theme', isDark ? 'dark' : 'light');
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.innerText = message;
    toast.classList.add('show-toast');
    
    setTimeout(() => {
        toast.classList.remove('show-toast');
    }, 2500);
}

// --- 3. LOGIKA KATALOG (DENGAN NAVIGASI SLUG) ---
function renderCatalog() {
    const catalogContainer = document.getElementById('main-catalog');
    if (!catalogContainer) return;

    const filtered = currentCategory === "Semua" 
        ? products 
        : products.filter(p => p.category === currentCategory);

    catalogContainer.innerHTML = filtered.map(p => {
        const isOutOfStock = p.stock <= 0;
        const slug = createSlug(p.name);
        const stockStatus = isOutOfStock 
            ? `<span style="color: #ff4d4d; font-size: 11px; font-weight: bold;">Habis</span>` 
            : `<span style="color: #25d366; font-size: 11px;">Stok: ${p.stock}</span>`;

        return `
            <div class="product-card" 
                 onclick="${isOutOfStock ? "showToast('Maaf, stok sedang habis!')" : `window.location.href='/product/${slug}'`}" 
                 style="${isOutOfStock ? 'opacity: 0.6; filter: grayscale(1);' : ''}">
                ${p.limited ? '<span class="limited-badge">STOK TERBATAS</span>' : ''}
                <img src="/assets/${p.img}" alt="${p.name}">
                <div style="font-size: 14px; font-weight: 600; margin-bottom: 2px;">${p.name}</div>
                <div style="margin-bottom: 5px;">${stockStatus}</div>
                <div style="color: var(--primary); font-weight: bold; font-size: 13px;">Rp ${p.price.toLocaleString('id-ID')}</div>
            </div>
        `;
    }).join('');
}

function filterCategory(category, element) {
    currentCategory = category;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (element) element.classList.add('active');
    renderCatalog();
}

// --- 4. LOGIKA PEMBAYARAN (MODAL SELECTOR) ---
function openPaymentSelector() {
    const modal = document.getElementById('paymentSelectorModal');
    if (modal) {
        modal.style.display = 'flex';
        updateRadioUI();
    }
}

function selectPayment(value, text) {
    document.getElementById('paymentMethod').value = value;
    document.getElementById('selectedPaymentText').innerText = text;
    document.getElementById('paymentSelectorModal').style.display = 'none';
    calculateTotal(true);
}

function updateRadioUI() {
    const currentVal = document.getElementById('paymentMethod').value;
    document.querySelectorAll('.radio-custom').forEach(rd => rd.classList.remove('radio-selected'));
    const activeRadio = document.getElementById('radio-' + currentVal);
    if (activeRadio) activeRadio.classList.add('radio-selected');
}

// --- 5. LOGIKA ORDER & MODAL ---
function openOrderModal(id) {
    selectedProduct = products.find(p => p.id === id);
    if (!selectedProduct) return;

    document.getElementById('modalImg').src = `/assets/${selectedProduct.img}`;
    document.getElementById('modalItemName').innerText = selectedProduct.name;
    document.getElementById('modalItemNote').innerText = selectedProduct.note;
    
    const label = document.getElementById('inputLabelText');
    const input = document.getElementById('usernameInput');

    if (selectedProduct.category === "Joki") {
        label.innerText = "Data Login (User & Pass)";
        input.placeholder = "Contoh: User: Yass | Pass: 123";
    } else if (selectedProduct.category === "Redfinger" || selectedProduct.category === "Akun") {
        label.innerText = "Nomor WA / Email Aktif";
        input.placeholder = "Untuk pengiriman data...";
    } else {
        label.innerText = "Username Roblox";
        input.placeholder = "Masukkan Username...";
    }

    document.getElementById('modalOrder').style.display = 'flex';
    document.getElementById('qtyInput').value = 1;
    
    // Default Payment
    document.getElementById('paymentMethod').value = "DANA";
    document.getElementById('selectedPaymentText').innerText = "DANA (Tanpa Biaya Admin)";
    
    calculateTotal(false); 
}

function closeOrderModal() {
    document.getElementById('modalOrder').style.display = 'none';
}

function calculateTotal(showNotif = true) {
    if (!selectedProduct) return;
    const qty = document.getElementById('qtyInput').value;
    const payment = document.getElementById('paymentMethod').value;
    
    if (showNotif) {
        showToast(`${payment} Terpilih ${payment === 'QRIS' ? '(+ Admin Rp 500)' : '(Tanpa Admin)'}`);
    }

    const adminFee = (payment === "QRIS") ? 500 : 0;
    const total = (selectedProduct.price * qty) + adminFee;
    document.getElementById('totalPriceText').innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

// --- 6. PENGIRIMAN WHATSAPP ---
function sendToWA() {
    const user = document.getElementById('usernameInput').value;
    const qty = document.getElementById('qtyInput').value;
    const payment = document.getElementById('paymentMethod').value;
    const total = document.getElementById('totalPriceText').innerText;

    if (!user) {
        showToast("Mohon isi data pengiriman/login!");
        return;
    }

    const skrg = new Date();
    const tgl = skrg.toLocaleDateString('id-ID');
    const jam = skrg.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    let userType = "Username";
    if (selectedProduct.category === "Joki") userType = "Data Login";
    else if (selectedProduct.category === "Redfinger" || selectedProduct.category === "Akun") userType = "Kontak";

    const message = `*PESANAN BARU - YASS STORE*%0A` +
                    `------------------------------%0A` +
                    `📦 Produk: *${selectedProduct.name}*%0A` +
                    `👤 ${userType}: *${user}*%0A` +
                    `🔢 Jumlah: ${qty}%0A` +
                    `💳 Pembayaran: ${payment}%0A` +
                    `💰 *Total: ${total}*%0A` +
                    `------------------------------%0A` +
                    `📅 Tanggal: ${tgl}%0A` +
                    `⏰ Jam: ${jam} WIB%0A%0A` +
                    `Mohon segera diproses, terima kasih!`;

    window.open(`https://wa.me/${WA_NUMBER}?text=${message}`, '_blank');
}

// --- 7. INITIALIZATION (DOM CONTENT LOADED) ---
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(); 
    renderCatalog();

    // A. CEK JIKA DATANG DARI HALAMAN DETAIL (DENGAN PARAMETER checkout_id)
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutId = urlParams.get('checkout_id');
    if (checkoutId) {
        openOrderModal(parseInt(checkoutId));
    }

    // B. MENAMPILKAN TANGGAL OTOMATIS DI HEADER
    const taglineArea = document.querySelector('.brand-text');
    if (taglineArea) {
        const dateElement = document.createElement('p');
        const sekarang = new Date();
        const opsi = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        
        dateElement.style.cssText = "color: #888; font-size: 11px; margin-top: 5px; font-weight: 500;";
        dateElement.innerText = "📅 " + sekarang.toLocaleDateString('id-ID', opsi);
        taglineArea.appendChild(dateElement);
    }
});

// Tutup modal jika klik di luar area
window.onclick = function(event) {
    const paymentModal = document.getElementById('paymentSelectorModal');
    const orderModal = document.getElementById('modalOrder');
    if (event.target == paymentModal) paymentModal.style.display = 'none';
    if (event.target == orderModal) orderModal.style.display = 'none';
}
