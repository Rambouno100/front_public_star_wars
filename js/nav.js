function injectNav() {
    const container = document.getElementById('main-nav');
    if (!container) return;

    const currentCat = new URLSearchParams(window.location.search).get('cat') || 'all';
    const cats = ['all', 'lego-helmet', 'lego-build', 'lego-keyring', 'posters'];

    container.innerHTML = `
    <nav class="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
        <div class="max-w-6xl mx-auto px-4 py-3">

            <div class="flex items-center gap-x-6">
                <a href="index.html" class="text-lg sm:text-xl uppercase tracking-widest font-semibold hover:opacity-60 transition-opacity shrink-0">
                    Star Wars <span class="text-neutral-500 font-normal">Store</span>
                </a>

                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 flex-1 min-w-0 hidden sm:flex">
                    ${cats.map(cat => `
                        <a href="index.html?cat=${cat}" class="text-[11px] uppercase tracking-widest transition-colors hover:text-white ${cat === currentCat ? 'text-white' : 'text-neutral-500'}">${cat}</a>
                    `).join('')}
                </div>

                <a href="cart.html" class="relative flex items-center ml-auto shrink-0 hover:opacity-60 transition-opacity">
                    <img src="./assets/cart.png" alt="Cart" class="w-5 h-5 object-contain">
                    <span id="cart-count" class="absolute -top-2.5 -right-3 w-4 h-4 rounded-full bg-white text-black text-[0.6rem] font-medium flex items-center justify-center">0</span>
                </a>

                <button class="sm:hidden text-neutral-400 hover:text-white" onclick="this.closest('nav').querySelector('.mobile-menu').classList.toggle('hidden')">☰</button>
            </div>

            <div class="mobile-menu hidden sm:hidden flex flex-col gap-2 pt-2">
                ${cats.map(cat => `
                    <a href="index.html?cat=${cat}" class="text-[11px] uppercase tracking-widest transition-colors hover:text-white ${cat === currentCat ? 'text-white' : 'text-neutral-500'}">${cat}</a>
                `).join('')}
            </div>

        </div>
    </nav>
`;

    if (typeof updateCartCount === 'function') updateCartCount();
}

document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', injectNav)
    : injectNav();