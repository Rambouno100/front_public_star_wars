import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useProducts, useProduct } from '../hooks/useProducts';
import { useCart } from '../../cart/hooks/useCart';
import { LaptopAdvisorCatalog } from './LaptopAdvisorCatalog';
import { ProductDetail } from './ProductComponents';

const fMono = "'Space Mono', ui-monospace, Menlo, monospace";
const fDisplay = "'Space Grotesk', system-ui, sans-serif";

export default function IntegratedCatalog() {
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [purpose, setPurpose] = useState(null);
  const [flashOnly, setFlashOnly] = useState(false);
  const [faction, setFaction] = useState(null);
  const [era, setEra] = useState(null);
  const [collectibleOnly, setCollectibleOnly] = useState(false);
  const debounceRef = useRef(null);

  const handleSearchChange = useCallback((value) => {
    setInputValue(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value), 400);
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts({ q: search, purpose, flashOnly, faction, era, collectibleOnly, limit: 20 });

  const products = useMemo(
    () => data?.pages?.flatMap(p => p.items) ?? [],
    [data]
  );

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const cartHook = useCart();
  const currentView = location.pathname.includes('/product/') ? 'detail' : 'catalog';

  // Fast-path: si ya tenemos el producto en la lista paginada, lo usamos sin esperar fetch.
  // Fallback: si el usuario entra directo a /product/:id y no está en las páginas cargadas,
  // useProduct hace GET /products/:id/ por su cuenta.
  const productFromList = useMemo(
    () => (id ? products.find(p => String(p.id) === String(id) || String(p.id_product) === String(id)) : null),
    [id, products]
  );
  const { data: productFromApi, isLoading: isLoadingProduct } =
    useProduct(id && !productFromList ? id : null);
  const selectedProduct = productFromList || productFromApi || null;

  // Detail view va primero: no debe bloquearse por la carga del catálogo,
  // porque useProduct trae el producto por su cuenta vía GET /products/:id/.
  if (currentView === 'detail') {
    if (!selectedProduct && isLoadingProduct) return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-ink)', fontFamily: fMono, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 400, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-cream)', opacity: 0.4 }}>
          Cargando producto...
        </span>
      </div>
    );
    return (
      <ProductDetail
        product={selectedProduct}
        onBack={() => navigate('/catalogo')}
        cartHook={cartHook}
      />
    );
  }

  // isLoading es true solo cuando no hay datos en caché (primera carga).
  // Con placeholderData, durante búsquedas siguientes data sigue disponible.
  if (isLoading && !data) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-ink)', fontFamily: fMono, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 10, fontWeight: 400, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-cream)', opacity: 0.4 }}>
        Cargando catálogo...
      </span>
    </div>
  );

  if (isError) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-ink)', fontFamily: fDisplay, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 400, textAlign: 'center' }}>
        <span style={{ fontFamily: fMono, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-cream)', opacity: 0.4, display: 'block', marginBottom: 16 }}>Error</span>
        <p style={{ fontSize: 15, color: 'var(--color-cream)', marginBottom: 28, opacity: 0.7 }}>Error al cargar productos</p>
        <button onClick={() => window.location.reload()}
          style={{ padding: '12px 28px', background: '#EEEAE0', color: '#0A0A0B', border: 'none', cursor: 'pointer', fontFamily: fMono, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Reintentar
        </button>
      </div>
    </div>
  );

  return (
    <LaptopAdvisorCatalog
      products={products}
      onViewDetail={p => navigate(`/product/${p.id ?? p.id_product}`)}
      search={inputValue}
      onSearchChange={handleSearchChange}
      purpose={purpose}
      onPurposeChange={setPurpose}
      flashOnly={flashOnly}
      onFlashOnlyChange={setFlashOnly}
      faction={faction}
      onFactionChange={setFaction}
      era={era}
      onEraChange={setEra}
      collectibleOnly={collectibleOnly}
      onCollectibleOnlyChange={setCollectibleOnly}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={fetchNextPage}
    />
  );
}
