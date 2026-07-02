import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, ArrowUpDown, X, ChevronDown, Check, Settings, CirclePlus, Minus, Plus, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { useCart } from './useCart';

const THEME = {
  primary: '#0095f6',
  background: '#0a0a0a',
  cardBg: '#111111',
  textPrimary: '#EEEEEE',
  textSecondary: '#999999',
  border: '#343535'
};

const COLUMNAS = [
  { clave: 'id_product', etiqueta: 'ID', mostrarPorDefecto: true, ancho: 0.5 },
  { clave: 'name', etiqueta: 'Nombre', mostrarPorDefecto: true, ancho: 2 },
  { clave: 'brand', etiqueta: 'Marca', mostrarPorDefecto: true, ancho: 1 },
  { clave: 'cpu', etiqueta: 'CPU', mostrarPorDefecto: true, ancho: 1.5 },
  { clave: 'gpu', etiqueta: 'GPU', mostrarPorDefecto: true, ancho: 1 },
  { clave: 'ram', etiqueta: 'RAM', mostrarPorDefecto: true, ancho: 0.5 },
  { clave: 'screen_size', etiqueta: 'Pantalla"', mostrarPorDefecto: true, ancho: 0.75 },
  { clave: 'storage', etiqueta: 'Almacenamiento', mostrarPorDefecto: true, ancho: 1 },
  { clave: 'screen_resolution', etiqueta: 'Resolución', mostrarPorDefecto: true, ancho: 1 },
  { clave: 'price', etiqueta: 'Precio', mostrarPorDefecto: true, ancho: 0.5 },
  { clave: 'actions', etiqueta: 'Acciones', mostrarPorDefecto: true, ancho: 1.5 }
];

const useClickOutside = (callback) => {
  const ref = useRef();
  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) callback();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);
  return ref;
};

const Checkbox = ({ checked, onClick, children, className = "" }) => (
  <div className={`flex items-center px-2 py-1 rounded-md cursor-pointer hover:bg-opacity-10 hover:bg-white ${className}`} onClick={onClick}>
    <div className="w-3 h-3 mr-1 flex items-center justify-center rounded-sm" style={{ backgroundColor: checked ? THEME.primary : 'transparent', border: `1px solid ${checked ? THEME.primary : THEME.border}` }}>
      {checked && <Check size={8} color="white" />}
    </div>
    <span className={`truncate text-xs ${children === 'Seleccionar todo' ? 'font-medium' : ''}`}>{children}</span>
  </div>
);

const FilterDropdown = ({ etiqueta, opciones, onChange, seleccionados = [] }) => {
  const [abierto, setAbierto] = useState(false);
  const [busquedaLocal, setBusquedaLocal] = useState('');
  const ref = useClickOutside(() => setAbierto(false));
  
  const opcionesFiltradas = useMemo(() => 
    opciones.filter(op => String(op).toLowerCase().includes(busquedaLocal.toLowerCase())), 
    [opciones, busquedaLocal]
  );

  const todoSeleccionado = useMemo(() => 
    opcionesFiltradas.length > 0 && opcionesFiltradas.every(op => seleccionados.includes(op)), 
    [opcionesFiltradas, seleccionados]
  );

  const seleccionarTodo = () => {
    onChange(todoSeleccionado 
      ? seleccionados.filter(s => !opcionesFiltradas.includes(s))
      : [...new Set([...seleccionados, ...opcionesFiltradas])]
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button 
        type="button" 
        onClick={() => setAbierto(!abierto)}
        className="flex items-center justify-between w-full px-2 py-1 rounded-md text-sm truncate"
        style={{ backgroundColor: THEME.cardBg, border: `1px solid ${THEME.border}` }}
      >
        <span className="truncate text-xs">
          {seleccionados.length === 0 ? etiqueta : `${etiqueta} (${seleccionados.length})`}
        </span>
        <ChevronDown size={14} />
      </button>
      
      {abierto && (
        <div className="absolute z-10 mt-1 w-48 rounded-md shadow-lg max-h-60 overflow-auto" style={{ backgroundColor: THEME.cardBg, border: `1px solid ${THEME.border}` }}>
          <div className="p-1">
            <div className="p-1 sticky top-0" style={{ backgroundColor: THEME.cardBg }}>
              <div className="relative">
                <Search size={12} className="absolute left-2 top-1/2 transform -translate-y-1/2" style={{ color: THEME.textSecondary }} />
                <input 
                  type="text" 
                  value={busquedaLocal} 
                  onChange={(e) => setBusquedaLocal(e.target.value)}
                  placeholder="Buscar..." 
                  className="w-full pl-6 pr-2 py-1 rounded-md text-xs"
                  style={{ backgroundColor: THEME.cardBg, border: `1px solid ${THEME.border}`, color: THEME.textPrimary }}
                />
              </div>
            </div>
            
            {opcionesFiltradas.length > 0 && (
              <div className="border-b mb-1" style={{ borderColor: THEME.border }}>
                <Checkbox checked={todoSeleccionado} onClick={seleccionarTodo}>
                  Seleccionar todo
                </Checkbox>
              </div>
            )}
            
            <div className="text-xs">
              {opcionesFiltradas.length === 0 ? (
                <div className="px-2 py-1 text-gray-400">No hay resultados</div>
              ) : (
                opcionesFiltradas.map(opcion => (
                  <Checkbox 
                    key={opcion} 
                    checked={seleccionados.includes(opcion)}
                    onClick={() => onChange(seleccionados.includes(opcion) 
                      ? seleccionados.filter(i => i !== opcion) 
                      : [...seleccionados, opcion]
                    )}
                  >
                    {opcion}
                  </Checkbox>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ColumnSelector = ({ columnas, columnasVisibles, onChange }) => {
  const [abierto, setAbierto] = useState(false);
  const ref = useClickOutside(() => setAbierto(false));

  return (
    <div className="relative" ref={ref}>
      <button 
        type="button" 
        onClick={() => setAbierto(!abierto)}
        className="flex items-center justify-center px-2 py-1 rounded-md"
        style={{ backgroundColor: THEME.primary }} 
        title="Configurar columnas"
      >
        <Settings size={16} />
      </button>
      
      {abierto && (
        <div className="absolute right-0 z-10 mt-1 w-48 rounded-md shadow-lg" style={{ backgroundColor: THEME.cardBg, border: `1px solid ${THEME.border}` }}>
          <div className="p-2 text-xs">
            <div className="font-bold mb-1">Mostrar columnas:</div>
            {columnas.map(columna => (
              <Checkbox 
                key={columna.clave} 
                checked={columnasVisibles.includes(columna.clave)}
                onClick={() => onChange(columnasVisibles.includes(columna.clave)
                  ? columnasVisibles.filter(c => c !== columna.clave)
                  : [...columnasVisibles, columna.clave]
                )}
              >
                {columna.etiqueta}
              </Checkbox>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CartButton = ({ product, cartHook }) => {
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const { isInCart, quantity } = useMemo(() => {
    if (!cartHook?.cartData?.salesorderline_set) return { isInCart: false, quantity: 0 };
    
    const line = cartHook.cartData.salesorderline_set.find(
      line => line.product === product.id_product && !line.pull
    );
    
    return {
      isInCart: !!line,
      quantity: line ? parseInt(line.product_qty) || 0 : 0
    };
  }, [cartHook?.cartData, product.id_product]);

  const handleCartAction = async (action) => {
    try {
      if (!cartHook?.updateCartQuantity) return;
      
      if (action === 'toggle') {
        await cartHook.updateCartQuantity(product.id_product, isInCart ? 0 : 1, product.price);
      } else if (action === 'increase') {
        await cartHook.updateCartQuantity(product.id_product, quantity + 1, product.price);
      } else if (action === 'decrease') {
        await cartHook.updateCartQuantity(product.id_product, quantity - 1, product.price);
      }
    } catch (error) {
      console.error('Error en cart action:', error);
      setShowLoginAlert(true);
    }
  };

  if (showLoginAlert) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Debe loguearse primero</h3>
          <p className="text-gray-600 mb-6">Para agregar productos al carrito, necesitas iniciar sesión.</p>
          <div className="flex gap-3">
            <button 
              onClick={() => window.open('https://galactic-market.com/login', '_blank')}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Ir a Login
            </button>
            <button 
              onClick={() => setShowLoginAlert(false)}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <button 
        className={`flex items-center px-2 py-1 rounded-md text-xs font-medium transition-colors ${
          isInCart 
            ? 'bg-orange-600 hover:bg-orange-700 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        } ${cartHook?.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => handleCartAction('toggle')}
        disabled={cartHook?.loading}
        style={{ minWidth: '70px' }}
      >
        <CirclePlus size={12} className="mr-1" />
        {cartHook?.loading ? 'Cargando...' : isInCart ? 'Agregado' : 'Agregar'}
      </button>
      
      {isInCart && (
        <div className="flex items-center gap-1 bg-gray-800 rounded-md px-1 py-1">
          <button 
            className="flex items-center justify-center w-5 h-5 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs"
            onClick={() => handleCartAction('decrease')}
            disabled={cartHook?.loading}
          >
            <Minus size={10} />
          </button>
          <span className="text-xs font-medium w-6 text-center text-white">{quantity}</span>
          <button 
            className="flex items-center justify-center w-5 h-5 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs"
            onClick={() => handleCartAction('increase')}
            disabled={cartHook?.loading}
          >
            <Plus size={10} />
          </button>
        </div>
      )}
    </div>
  );
};

const WhatsAppButton = ({ product }) => {
  const handleWhatsApp = () => {
    const message = `Hola! Me interesa esta laptop:%0A%0A*id: ${product.id_product}*%0A*Nombre: ${product.name}*%0APrecio: S/${product.price}%0A%0A¿Podrías darme más información?`;
    window.open(`https://wa.me/51956787186?text=${message}`, '_blank');
  };

  return (
    <button 
      onClick={handleWhatsApp}
      className="flex items-center justify-center px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors"
      title="Consultar por WhatsApp"
      style={{ minWidth: '70px' }}
    >
      <MessageCircle size={12} className="mr-1" />
      Consultar
    </button>
  );
};

const ProductActions = ({ product, cartHook }) => (
  <div className="flex flex-col items-center gap-1 min-w-0">
    <CartButton product={product} cartHook={cartHook} />
    <WhatsAppButton product={product} />
  </div>
);

export default function Catalogoproducts({ checkAuthStatus = () => Promise.resolve(false) }) {
  const [products, setProducts] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [multiSelectFilters, setMultiSelectFilters] = useState({});
  const [orden, setOrden] = useState({ clave: 'name', direccion: 'asc' });
  const [opcionesFiltros, setOpcionesFiltros] = useState({});
  const [columnasVisibles, setColumnasVisibles] = useState(
    COLUMNAS.filter(col => col.mostrarPorDefecto).map(col => col.clave)
  );
  
  const cartHook = useCart(checkAuthStatus);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true);
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/products/`);
        const allProducts = Array.isArray(data) ? data : data.results || [];
        const laptops = allProducts.filter(p => p.type === 'laptop');
        setProducts(laptops);
        
        const opcionesObj = {};
        COLUMNAS.forEach(({ clave }) => {
          if (clave !== 'actions') {
            opcionesObj[clave] = [...new Set(laptops.map(p => p[clave]).filter(Boolean))].sort();
          }
        });
        setOpcionesFiltros(opcionesObj);
        
        if (cartHook?.loadCart) await cartHook.loadCart();
        
      } catch (err) {
        setError('Error al cargar productos');
        console.error('Error fetching data:', err);
      } finally {
        setCargando(false);
      }
    };
    
    fetchData();
  }, []);

  const calcularAnchoColumna = (clave) => {
    const columna = COLUMNAS.find(col => col.clave === clave);
    const columnasVisiblesData = COLUMNAS.filter(col => columnasVisibles.includes(col.clave));
    const anchoTotal = columnasVisiblesData.reduce((sum, col) => sum + col.ancho, 0);
    return columna ? `${(columna.ancho / anchoTotal) * 100}%` : 'auto';
  };

  const cambiarOrden = (clave) => {
    if (clave === 'actions') return;
    setOrden(prev => ({
      clave,
      direccion: prev.clave === clave && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
  };

  const productsFiltrados = useMemo(() => {
    return products
      .filter(product => {
        if (busqueda && !Object.values(product).some(valor => 
          valor && String(valor).toLowerCase().includes(busqueda.toLowerCase())
        )) return false;
        
        return Object.entries(multiSelectFilters).every(([clave, valores]) => 
          !valores?.length || valores.includes(product[clave])
        );
      })
      .sort((a, b) => {
        if (orden.clave === 'actions') return 0;
        const valorA = a[orden.clave] || '';
        const valorB = b[orden.clave] || '';
        
        if (orden.clave === 'price') {
          const numA = parseFloat(valorA) || 0;
          const numB = parseFloat(valorB) || 0;
          return orden.direccion === 'asc' ? numA - numB : numB - numA;
        }
        
        const comparison = String(valorA).localeCompare(String(valorB));
        return orden.direccion === 'asc' ? comparison : -comparison;
      });
  }, [products, busqueda, multiSelectFilters, orden]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setMultiSelectFilters({});
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ color: THEME.textPrimary }}>
        Cargando productos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-1" style={{ backgroundColor: THEME.background, color: THEME.textPrimary }}>
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-lg font-bold">Catálogo de Laptops</h1>
          <ColumnSelector 
            columnas={COLUMNAS} 
            columnasVisibles={columnasVisibles} 
            onChange={setColumnasVisibles} 
          />
        </div>
        
        <div className="mb-3 p-2 rounded-lg" style={{ backgroundColor: THEME.cardBg }}>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="relative flex-grow">
              <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2" style={{ color: THEME.textSecondary }} />
              <input 
                type="text" 
                value={busqueda} 
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar..." 
                className="w-full pl-8 pr-2 py-1 rounded-md text-sm"
                style={{ backgroundColor: THEME.cardBg, border: `1px solid ${THEME.border}`, color: THEME.textPrimary }}
              />
            </div>
            
            <button 
              onClick={limpiarFiltros}
              className="flex-shrink-0 flex items-center justify-center px-2 py-1 rounded-md text-xs"
              style={{ backgroundColor: THEME.primary }}
            >
              <X size={14} className="mr-1" />
              Reset
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 mt-2">
            {COLUMNAS
              .filter(col => columnasVisibles.includes(col.clave) && col.clave !== 'actions')
              .map(({ clave, etiqueta }) => (
                <FilterDropdown 
                  key={clave} 
                  etiqueta={etiqueta} 
                  opciones={opcionesFiltros[clave] || []}
                  seleccionados={multiSelectFilters[clave] || []}
                  onChange={(valores) => setMultiSelectFilters(prev => ({ ...prev, [clave]: valores }))} 
                />
              ))
            }
          </div>
        </div>

        <div className="mb-2 text-xs">
          Mostrando <span className="font-bold">{productsFiltrados.length}</span> de <span className="font-bold">{products.length}</span> laptops
        </div>

        <div className="hidden sm:block overflow-x-auto rounded-lg w-full" style={{ backgroundColor: THEME.cardBg }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: `1px solid ${THEME.border}` }}>
                {COLUMNAS.filter(col => columnasVisibles.includes(col.clave)).map(({ clave, etiqueta }) => (
                  <th 
                    key={clave} 
                    className={`px-1 py-2 text-left font-medium ${clave !== 'actions' ? 'cursor-pointer' : ''}`}
                    onClick={() => cambiarOrden(clave)} 
                    style={{ width: calcularAnchoColumna(clave) }}
                  >
                    <div className="flex items-center">
                      <span className="truncate">{etiqueta}</span>
                      {clave !== 'actions' && <ArrowUpDown size={12} className="ml-1 flex-shrink-0" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={columnasVisibles.length} className="px-2 py-4 text-center">
                    No se encontraron laptops
                  </td>
                </tr>
              ) : (
                productsFiltrados.map(product => (
                  <tr 
                    key={product.id_product} 
                    style={{ borderBottom: `1px solid ${THEME.border}` }} 
                    className="hover:bg-opacity-10 hover:bg-white"
                  >
                    {COLUMNAS.filter(col => columnasVisibles.includes(col.clave)).map(({ clave }) => (
                      <td key={`${product.id_product}-${clave}`} className="px-1 py-2">
                        <div className="break-words">
                          {clave === 'actions' ? (
                            <ProductActions product={product} cartHook={cartHook} />
                          ) : clave === 'screen_size' ? (
                            `${product[clave] || '-'}"`
                          ) : (
                            product[clave] || '-'
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="sm:hidden mt-4 space-y-3">
          {productsFiltrados.length === 0 ? (
            <div className="p-4 text-center rounded-lg" style={{ backgroundColor: THEME.cardBg }}>
              No se encontraron laptops
            </div>
          ) : (
            productsFiltrados.map(product => (
              <div 
                key={product.id_product} 
                className="p-3 rounded-lg shadow-sm"
                style={{ backgroundColor: THEME.cardBg, border: `1px solid ${THEME.border}` }}
              >
                <div className="font-medium text-sm mb-2 break-words" style={{ color: THEME.primary }}>
                  {product.name || '-'}
                </div>
                
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-3">
                  {COLUMNAS
                    .filter(col => columnasVisibles.includes(col.clave) && col.clave !== 'name' && col.clave !== 'actions')
                    .map(({ clave, etiqueta }) => (
                      <div key={`${product.id_product}-${clave}`} className="text-xs">
                        <span className="text-gray-400">{etiqueta}:</span>{' '}
                        <span className="font-medium break-words">
                          {clave === 'screen_size' ? `${product[clave] || '-'}"` : product[clave] || '-'}
                        </span>
                      </div>
                    ))
                  }
                </div>
                
                {columnasVisibles.includes('actions') && (
                  <div className="flex justify-center">
                    <ProductActions product={product} cartHook={cartHook} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}