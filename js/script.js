const WA_NUMBER = "6283898578903";
let selectedProduct = null;
let currentCategory = "Semua";

// --- FUNGSI TAMBAHAN UNTUK DARK MODE V1.1 ---
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

// FUNGSI TOAST NOTIFICATION
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.innerText = message;
    toast.classList.add('show-toast');
    
    setTimeout(() => {
        toast.classList.remove('show-toast');
    }, 2500);
}

// --- LOGIKA BARU: CUSTOM PAYMENT SELECTOR (Sesuai Gambar) ---
function openPaymentSelector() {
    const modal = document.getElementById('paymentSelectorModal');
    if (modal) {
        modal.style.display = 'flex';
        updateRadioUI();
    }
}

function selectPayment(value, text) {
    // Set value ke input tersembunyi
    document.getElementById('paymentMethod').value = value;
    // Ubah teks di tampilan pemicu (trigger)
    document.getElementById('selectedPaymentText').innerText = text;
    // Tutup dialog
    document.getElementById('paymentSelectorModal').style.display = 'none';
    
    // Jalankan kalkulasi total dengan toast
    calculateTotal(true);
}

function updateRadioUI() {
    const currentVal = document.getElementById('paymentMethod').value;
    // Hapus kelas 'active' dari semua radio
    document.querySelectorAll('.radio-custom').forEach(rd => rd.classList.remove('radio-selected'));
    // Tambah kelas ke yang terpilih
    const activeRadio = document.getElementById('radio-' + currentVal);
    if (activeRadio) activeRadio.classList.add('radio-selected');
}

// Tutup modal jika klik di luar area konten
window.onclick = function(event) {
    const modal = document.getElementById('paymentSelectorModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
// ------------------------------------------------------------

function renderCatalog() {
    const catalogContainer = document.getElementById('main-catalog');
    if (!catalogContainer) return;

    const filtered = currentCategory === "Semua" 
        ? products 
        : products.filter(p => p.category === currentCategory);

    catalogContainer.innerHTML = filtered.map(p => {
        const isOutOfStock = p.stock <= 0;
        const stockStatus = isOutOfStock 
            ? `<span style="color: #ff4d4d; font-size: 11px; font-weight: bold;">Habis</span>` 
            : `<span style="color: #25d366; font-size: 11px;">Stok: ${p.stock}</span>`;

        return `
            <div class="product-card" 
                 onclick="${isOutOfStock ? "showToast('Maaf, stok sedang habis!')" : `openOrderModal(${p.id})`}" 
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

function openOrderModal(id) {
    selectedProduct = products.find(p => p.id === id);
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
    
    // Reset ke DANA setiap buka modal
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
        if (payment === "QRIS") {
            showToast("QRIS Terpilih (+ Biaya Admin Rp 500)");
        } else {
            showToast("DANA Terpilih (Tanpa Biaya Admin)");
        }
    }

    const adminFee = (payment === "QRIS") ? 500 : 0;
    const total = (selectedProduct.price * qty) + adminFee;
    document.getElementById('totalPriceText').innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

function sendToWA() {
    const user = document.getElementById('usernameInput').value;
    const qty = document.getElementById('qtyInput').value;
    const payment = document.getElementById('paymentMethod').value;
    const total = document.getElementById('totalPriceText').innerText;

    if (!user) {
        showToast("Mohon isi data pengiriman/login!");
        return;
    }

    let userType = "Username";
    if (selectedProduct.category === "Joki") userType = "Data Login";
    else if (selectedProduct.category === "Redfinger" || selectedProduct.category === "Akun") userType = "Kontak";

    const message = `Halo Yass Store, saya ingin memesan:\n\n` +
                    `📦 Produk: *${selectedProduct.name}*\n` +
                    `👤 ${userType}: *${user}*\n` +
                    `🔢 Jumlah: ${qty}\n` +
                    `💳 Pembayaran: ${payment}\n` +
                    `💰 *Total: ${total}*\n\n` +
                    `Mohon segera diproses, terima kasih!`;

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
    applyTheme(); 
    renderCatalog();
});
