const API_URL = 'https://starwars.drophack.vip/graphql';

const GET_PRODUCTS = `
  query {
    getProducts {
      id name price description imageUrl category
    }
  }
`;

// Lógica de Fetch

async function fetchProducts() {
    const container = document.getElementById('product-container');
    if (!container) return;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: GET_PRODUCTS }),
        });

        const { data, errors } = await res.json();
        if (errors) throw new Error(errors[0].message);

        renderProducts(data.getProducts);
    } catch (err) {
        console.error(err);
        container.innerHTML = `
            <p class="col-span-full text-xs uppercase tracking-widest text-neutral-500 text-center py-20">No se pudo conectar al servidor.</p>`;
    }
}

// Renderización en el DOM

function renderProducts(products) {
    const container = document.getElementById('product-container');
    const filtered = filterByCategory(products);

    if (filtered.length === 0) {
        container.innerHTML = `
            <p class="col-span-full text-xs uppercase tracking-widest text-neutral-500 text-center py-20">No hay productos en esta categoría</p>`;
        return;
    }

    container.innerHTML = filtered.map(productCard).join('');
}


function productCard(p) {
    return `
        <article class="overflow-hidden rounded-xl flex flex-col border border-neutral-800 hover:-translate-y-1 transition-transform duration-300 group">
            <div class="overflow-hidden bg-neutral-900 flex items-center justify-center p-4">
                <img src="${p.imageUrl}" alt="${p.name}" class="w-full aspect-[2/3] object-contain bg-neutral-900 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
            </div>
            <div class="flex-1 flex flex-col gap-4 p-5">
                <div class="flex-1">
                    <h3 class="text-[16px] font-medium">${p.name}</h3>
                    <p class="text-[14px] leading-relaxed line-clamp-2 text-neutral-500 mt-1">${p.description}</p>
                </div>
                <div class="flex justify-between items-center">
                    <span class="font-medium">$${p.price.toFixed(2)}</span>
                    <button class="btn-add px-5 py-2 rounded-full bg-white text-black text-xs uppercase tracking-widest hover:bg-neutral-200 active:scale-95 transition-all" data-product='${JSON.stringify(p)}'>Add</button>
                </div>
            </div>
        </article>
    `;
}

function filterByCategory(products) {
    const cat = new URLSearchParams(window.location.search).get('cat');
    if (!cat || cat === 'all') return products;
    return products.filter(p => p.category === cat);
}

// Listeners de Eventos

document.addEventListener('click', (e) => {
    if (e.target.matches('.btn-add')) addToCart(JSON.parse(e.target.dataset.product));
});

// Inicialización

fetchProducts();