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

// RENDER KATALOG
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
    
    // Simpan kategori global agar fungsi scanner di index.html bisa mendeteksi
    window.currentCategory = selectedProduct.category;

    document.getElementById('modalImg').src = `/assets/${selectedProduct.img}`;
    document.getElementById('modalItemName').innerText = selectedProduct.name;
    document.getElementById('modalItemNote').innerText = selectedProduct.note;
    
    const label = document.getElementById('inputLabelText');
    const input = document.getElementById('usernameInput');
    const robloxPreview = document.getElementById('roblox-preview');

    // Reset input dan preview scanner setiap kali modal dibuka
    input.value = '';
    if (robloxPreview) robloxPreview.style.display = 'none';

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
    calculateTotal();
}

function closeOrderModal() {
    document.getElementById('modalOrder').style.display = 'none';
}

function calculateTotal() {
    if (!selectedProduct) return;
    const qty = document.getElementById('qtyInput').value;
    const payment = document.getElementById('paymentMethod').value;
    const adminFee = (payment === "QRIS") ? 500 : 0;
    const total = (selectedProduct.price * qty) + adminFee;
    document.getElementById('totalPriceText').innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

function sendToWA() {
    const user = document.getElementById('usernameInput').value;
    const qty = document.getElementById('qtyInput').value;
    const payment = document.getElementById('paymentMethod').value;
    const total = document.getElementById('totalPriceText').innerText;
    const robloxPreview = document.getElementById('roblox-preview');

    if (!user) {
        showToast("Mohon isi data pengiriman/login!");
        return;
    }

    let userType = "Username";
    let validationStatus = "";

    if (selectedProduct.category === "Joki") {
        userType = "Data Login";
    } else if (selectedProduct.category === "Redfinger" || selectedProduct.category === "Akun") {
        userType = "Kontak";
    } else if (selectedProduct.category === "Robux") {
        // Cek apakah preview avatar muncul (berarti akun valid)
        if (robloxPreview && robloxPreview.style.display === 'flex') {
            const displayName = document.getElementById('roblox-display-name').innerText;
            validationStatus = `\n✅ *Status: Akun Terverifikasi (${displayName})*`;
        }
    }

    const message = `Halo Yass Store, saya ingin memesan:\n\n` +
                    `📦 Produk: *${selectedProduct.name}*\n` +
                    `👤 ${userType}: *${user}*${validationStatus}\n` +
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
