
function injectFooter() {
  const container = document.getElementById('main-footer');
  if (!container) return;

  container.innerHTML = `
    <footer class="border-t border-neutral-800 mt-24">
      <div class="max-w-6xl mx-auto px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-10">

        <div class="col-span-2 md:col-span-1">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            Star Wars <span class="text-neutral-500 font-normal">Store</span>
          </p>
          <p class="text-neutral-500 text-xs leading-relaxed">
            Coleccionables de la galaxia muy, muy lejana.
          </p>
        </div>

        <div>
          <p class="text-xs uppercase tracking-widest text-neutral-400 mb-4">Tienda</p>
          <ul class="space-y-2">
            ${['Productos', 'Novedades', 'Ofertas', 'Edición limitada'].map(l => `
              <li><a href="#" class="text-neutral-500 text-xs hover:text-white transition-colors">${l}</a></li>
            `).join('')}
          </ul>
        </div>

        <div>
          <p class="text-xs uppercase tracking-widest text-neutral-400 mb-4">Ayuda</p>
          <ul class="space-y-2">
            ${['Envíos', 'Devoluciones', 'Contacto', 'FAQ'].map(l => `
              <li><a href="#" class="text-neutral-500 text-xs hover:text-white transition-colors">${l}</a></li>
            `).join('')}
          </ul>
        </div>

        <div>
          <p class="text-xs uppercase tracking-widest text-neutral-400 mb-4">Legal</p>
          <ul class="space-y-2">
            ${['Privacidad', 'Términos', 'Cookies'].map(l => `
              <li><a href="#" class="text-neutral-500 text-xs hover:text-white transition-colors">${l}</a></li>
            `).join('')}
          </ul>
        </div>

      </div>
      <div class="border-t border-neutral-800 max-w-6xl mx-auto px-8 py-5 flex justify-between items-center">
        <p class="text-neutral-600 text-xs">© ${new Date().getFullYear()} Star Wars Store</p>
      </div>
    </footer>
  `;
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', injectFooter)
  : injectFooter();