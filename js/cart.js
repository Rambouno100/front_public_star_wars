const CART_KEY = 'sw_cart';

// Manejo del Estado

function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

//Lógica del Carrito

function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.qty = (existing.qty || 1) + 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    saveCart(cart);
    showToast(`${product.name} añadido`);
}

function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
}

function changeQty(index, change) {
    const cart = getCart();
    cart[index].qty = (cart[index].qty || 1) + change;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    saveCart(cart);
    renderCart();
}

function calcTotal(cart) {
    return cart.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
}

//Renderizado de UI

function updateCartCount() {
    const el = document.getElementById('cart-count');
    if (el) el.textContent = getCart().reduce((s, i) => s + (i.qty || 1), 0);
}

function renderCart() {
    const container = document.getElementById('cart-container');
    if (!container) return;

    const cart = getCart();

    if (cart.length === 0) {
        container.innerHTML = `
            <p class="text-xs uppercase tracking-widest text-neutral-500 text-center py-16">Tu carrito está vacío</p>`;
        document.getElementById('cart-total').textContent = '0.00';
        return;
    }

    container.innerHTML = cart.map((item, i) => `
        <article class="flex flex-wrap items-center gap-x-4 gap-y-3 py-5 border-b border-neutral-800 last:border-0">
            <img src="${item.imageUrl}" alt="${item.name}" class="w-14 h-14 object-cover rounded border border-neutral-800 shrink-0">
            <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium truncate">${item.name}</h4>
                <p class="text-sm text-neutral-400 mt-0.5">$${item.price.toFixed(2)}</p>
            </div>
            <div class="flex items-center gap-3 ml-auto">
                <div class="flex items-center gap-2">
                    <button class="btn-qty w-6 h-6 rounded-full border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors text-sm leading-none" data-index="${i}" data-change="-1">−</button>
                    <span class="text-sm w-4 text-center">${item.qty || 1}</span>
                    <button class="btn-qty w-6 h-6 rounded-full border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors text-sm leading-none" data-index="${i}" data-change="1">+</button>
                </div>
                <button class="btn-remove px-3 py-1.5 rounded-full text-xs uppercase tracking-widest text-neutral-500 border border-neutral-800 hover:text-red-500 hover:border-red-900 transition-colors" data-index="${i}">Quitar</button>
            </div>
        </article>
    `).join('');

    document.getElementById('cart-total').textContent = calcTotal(cart).toFixed(2);
}

//Listeners de Eventos

document.addEventListener('click', (e) => {
    if (e.target.matches('.btn-remove')) removeFromCart(Number(e.target.dataset.index));
    if (e.target.matches('.btn-qty')) changeQty(Number(e.target.dataset.index), Number(e.target.dataset.change));
    if (e.target.matches('#btn-checkout')) checkout();
});

function checkout() {
    if (getCart().length === 0) return showToast('Tu carrito está vacío');
    saveCart([]);
    renderCart();
    showToast('¡Compra exitosa! Que la fuerza te acompañe');
}

//Funciones de Utilidad (Toast)

function showToast(msg) {
    document.getElementById('toast')?.remove();

    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.textContent = msg;
    toast.className = `fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-white text-black text-xs uppercase tracking-widest transition-opacity duration-300`;

    document.body.appendChild(toast);
    setTimeout(() => toast.style.opacity = '0', 2500);
    setTimeout(() => toast.remove(), 2800);
}

// Inicialización

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCart();
});