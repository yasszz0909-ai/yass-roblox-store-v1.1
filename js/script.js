const WA_NUMBER = "6283898578903"; // <--- GANTI DENGAN NOMOR WA KAMU
let selectedProduct = null;

// 1. Fungsi Menampilkan Produk ke Halaman Home
function renderCatalog() {
    const catalogContainer = document.getElementById('main-catalog');
    if (!catalogContainer) return; // Jika tidak di halaman home, lewati

    catalogContainer.innerHTML = products.map(p => `
        <div class="product-card" onclick="openOrderModal(${p.id})">
            ${p.limited ? '<span class="limited-badge">STOK TERBATAS</span>' : ''}
            <img src="/assets/${p.img}" alt="${p.name}">
            <div style="font-size: 14px; font-weight: 600; margin-bottom: 5px;">${p.name}</div>
            <div style="color: var(--primary); font-weight: bold; font-size: 13px;">Rp ${p.price.toLocaleString('id-ID')}</div>
        </div>
    `).join('');
}

// 2. Fungsi Membuka Pop-up Pesanan
function openOrderModal(id) {
    selectedProduct = products.find(p => p.id === id);
    
    document.getElementById('modalImg').src = `/assets/${selectedProduct.img}`;
    document.getElementById('modalItemName').innerText = selectedProduct.name;
    document.getElementById('modalItemNote').innerText = selectedProduct.note;
    document.getElementById('modalOrder').style.display = 'flex';
    
    // Reset input
    document.getElementById('qtyInput').value = 1;
    calculateTotal();
}

function closeOrderModal() {
    document.getElementById('modalOrder').style.display = 'none';
}

// 3. Fungsi Hitung Harga Otomatis
function calculateTotal() {
    const qty = document.getElementById('qtyInput').value;
    const payment = document.getElementById('paymentMethod').value;
    
    const adminFee = (payment === "QRIS") ? 500 : 0;
    const total = (selectedProduct.price * qty) + adminFee;
    
    document.getElementById('totalPriceText').innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

// 4. Fungsi Kirim Data ke WhatsApp
function sendToWA() {
    const user = document.getElementById('usernameInput').value;
    const qty = document.getElementById('qtyInput').value;
    const payment = document.getElementById('paymentMethod').value;
    const total = document.getElementById('totalPriceText').innerText;

    if (!user) {
        alert("Mohon masukkan Username Roblox Anda!");
        return;
    }

    const message = `Halo Yass Store, saya ingin memesan:\n\n` +
                    `📦 Produk: *${selectedProduct.name}*\n` +
                    `👤 Username: *${user}*\n` +
                    `🔢 Jumlah: ${qty}\n` +
                    `💳 Pembayaran: ${payment}\n` +
                    `💰 *Total: ${total}*\n\n` +
                    `Mohon segera berikan payment nya.` +
                    `Saya akan segera mengirimkan bukti transfer.';

    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
}

// Jalankan fungsi tampilkan produk saat web dibuka
document.addEventListener('DOMContentLoaded', () => {
    renderCatalog();
    
    // Logika Dark Mode (Jika ada di localStorage)
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
});
