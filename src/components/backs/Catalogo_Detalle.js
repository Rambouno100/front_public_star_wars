import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, ArrowUpDown, X, ChevronDown, Check, Settings, CirclePlus, Minus, Plus, MessageCircle, ChevronLeft, ChevronRight, Heart, Share2, ArrowLeft, Star, Shield, Truck, RotateCcw } from 'lucide-react';
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
    const message = `Hola! Me interesa esta laptop:%0A%0A*ID: ${product.id_product}*%0A*Nombre: ${product.name}*%0APrecio: S/${product.price}%0A%0A¿Podrías darme más información?`;
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

const ProductActions = ({ product, cartHook, onViewDetail }) => (
  <div className="flex flex-col items-center gap-1 min-w-0">
    <button 
      onClick={() => onViewDetail(product)}
      className="flex items-center justify-center px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-medium transition-colors"
      style={{ minWidth: '70px' }}
    >
      Ver detalle
    </button>
    <CartButton product={product} cartHook={cartHook} />
    <WhatsAppButton product={product} />
  </div>
);

const ImageCarousel = ({ images, productName }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-lg" style={{ backgroundColor: THEME.cardBg }}>
        <img
          src={images[currentImage]?.image || images[currentImage]}
          alt={productName}
          className={`w-full h-full object-cover transition-transform duration-300 cursor-zoom-in ${isZoomed ? 'scale-150' : 'scale-100'}`}
          onClick={() => setIsZoomed(!isZoomed)}
        />
        
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-all"
            >
              <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImage ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
              index === currentImage 
                ? `border-[${THEME.primary}]` 
                : `border-[${THEME.border}]`
            }`}
          >
            <img
              src={image?.image || image}
              alt={`${productName} ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

const ProductDetail = ({ product, onBack, cartHook }) => {
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center" style={{ backgroundColor: THEME.background }}>
        <div className="text-center">
          <p className="text-xl mb-4" style={{ color: THEME.textPrimary }}>Producto no encontrado</p>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg flex items-center space-x-2"
            style={{ backgroundColor: THEME.primary, color: 'white' }}
          >
            <ArrowLeft size={16} />
            <span>Volver al catálogo</span>
          </button>
        </div>
      </div>
    );
  }

  const originalPrice = product.price ? Math.round(parseFloat(product.price) * 1.2) : null;
  const displayImages = product.images && product.images.length > 0 
    ? product.images 
    : product.main_image 
      ? [{ image: product.main_image }]
      : [];

  const specs = [
    { label: 'Marca', value: product.brand },
    { label: 'CPU', value: product.cpu },
    { label: 'GPU', value: product.gpu },
    { label: 'RAM', value: product.ram },
    { label: 'Almacenamiento', value: product.storage },
    { label: 'Pantalla', value: `${product.screen_size}" - ${product.screen_resolution}` },
    { label: 'Sistema Operativo', value: product.os },
  ].filter(spec => spec.value);

  const handleWhatsApp = () => {
    const message = `Hola! Me interesa esta laptop:%0A%0A*ID: ${product.id_product}*%0A*Nombre: ${product.name}*%0APrecio: S/${product.price}%0A%0A¿Podrías darme más información?`;
    window.open(`https://wa.me/51956787186?text=${message}`, '_blank');
  };

  const handleAddToCart = async () => {
    if (cartHook?.updateCartQuantity) {
      try {
        await cartHook.updateCartQuantity(product.id_product, quantity, product.price);
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: THEME.background, color: THEME.textPrimary }}>
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            style={{ color: THEME.primary }}
          >
            <ArrowLeft size={20} />
            <span>Volver al catálogo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {displayImages.length > 0 ? (
              <ImageCarousel images={displayImages} productName={product.name} />
            ) : (
              <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Sin imagen disponible</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-2xl lg:text-3xl font-bold leading-tight">
                {product.name}
              </h1>
              
              {product.price && (
                <div className="space-y-2">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold" style={{ color: THEME.primary }}>
                      S/ {product.price}
                    </span>
                    {originalPrice && (
                      <span className="text-lg line-through" style={{ color: THEME.textSecondary }}>
                        S/ {originalPrice}
                      </span>
                    )}
                  </div>
                  {originalPrice && (
                    <div className="text-sm text-green-500">
                      Ahorro: S/ {(originalPrice - parseFloat(product.price)).toFixed(2)} ({Math.round(((originalPrice - parseFloat(product.price)) / originalPrice) * 100)}% off)
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-sm" style={{ color: THEME.textSecondary }}>
                ID del producto: {product.id_product}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg" style={{ backgroundColor: THEME.cardBg }}>
              <div className="flex items-center space-x-2">
                <Shield size={20} style={{ color: THEME.primary }} />
                <span className="text-sm">Garantía oficial</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck size={20} style={{ color: THEME.primary }} />
                <span className="text-sm">Envío gratis</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw size={20} style={{ color: THEME.primary }} />
                <span className="text-sm">30 días devolución</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star size={20} style={{ color: THEME.primary }} />
                <span className="text-sm">Producto nuevo</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium">Cantidad:</span>
                <div className="flex items-center space-x-2 bg-gray-800 rounded-md px-3 py-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex items-center justify-center w-6 h-6 rounded bg-gray-600 hover:bg-gray-500 text-white transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-lg font-medium w-8 text-center text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex items-center justify-center w-6 h-6 rounded bg-gray-600 hover:bg-gray-500 text-white transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <CirclePlus size={20} />
                  <span>Agregar al carrito</span>
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle size={20} />
                  <span>Consultar por WhatsApp</span>
                </button>

                <div className="flex space-x-2">
                  <button className="flex-1 py-2 px-4 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2">
                    <Heart size={16} />
                    <span>Favoritos</span>
                  </button>
                  <button className="flex-1 py-2 px-4 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2">
                    <Share2 size={16} />
                    <span>Compartir</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 rounded-lg" style={{ backgroundColor: THEME.cardBg }}>
          <h3 className="text-xl font-semibold mb-4">Especificaciones</h3>
          <div className="grid grid-cols-1 gap-3">
            {specs.map((spec, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center py-2 border-b"
                style={{ borderColor: THEME.border }}
              >
                <span style={{ color: THEME.textSecondary }}>{spec.label}:</span>
                <span className="font-medium text-right max-w-xs">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {product.description && (
          <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: THEME.cardBg }}>
            <h3 className="text-xl font-semibold mb-4">Descripción del producto</h3>
            <p style={{ color: THEME.textSecondary }} className="leading-relaxed">
              {product.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const CatalogView = ({ products, onViewDetail, cartHook }) => {
  const [busqueda, setBusqueda] = useState('');
  const [multiSelectFilters, setMultiSelectFilters] = useState({});
  const [orden, setOrden] = useState({ clave: 'name', direccion: 'asc' });
  const [opcionesFiltros, setOpcionesFiltros] = useState({});
  const [columnasVisibles, setColumnasVisibles] = useState(
    COLUMNAS.filter(col => col.mostrarPorDefecto).map(col => col.clave)
  );

  useEffect(() => {
    const opcionesObj = {};
    COLUMNAS.forEach(({ clave }) => {
      if (clave !== 'actions') {
        opcionesObj[clave] = [...new Set(products.map(p => p[clave]).filter(Boolean))].sort();
      }
    });
    setOpcionesFiltros(opcionesObj);
  }, [products]);

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
                           <ProductActions product={product} cartHook={cartHook} onViewDetail={onViewDetail} />
                         ) : clave === 'screen_size' ? (
                           `${product[clave] || '-'}"`
                         ) : clave === 'name' ? (
                           <button 
                             onClick={() => onViewDetail(product)}
                             className="text-left hover:text-blue-400 transition-colors"
                           >
                             {product[clave] || '-'}
                           </button>
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
               <button 
                 onClick={() => onViewDetail(product)}
                 className="font-medium text-sm mb-2 break-words text-left w-full hover:text-blue-400 transition-colors"
                 style={{ color: THEME.primary }}
               >
                 {product.name || '-'}
               </button>
               
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
                   <ProductActions product={product} cartHook={cartHook} onViewDetail={onViewDetail} />
                 </div>
               )}
             </div>
           ))
         )}
       </div>
     </div>
   </div>
 );
};

export default function IntegratedCatalog({ checkAuthStatus = () => Promise.resolve(false) }) {
 const [products, setProducts] = useState([]);
 const [cargando, setCargando] = useState(true);
 const [error, setError] = useState(null);
 const [selectedProduct, setSelectedProduct] = useState(null);
 const [currentView, setCurrentView] = useState('catalog');
 
 const cartHook = useCart(checkAuthStatus);

 useEffect(() => {
   const fetchData = async () => {
     try {
       setCargando(true);
       const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/products/`);
       const allProducts = Array.isArray(data) ? data : data.results || [];
       const laptops = allProducts.filter(p => p.type === 'laptop' || p.type === 'Laptop');
       setProducts(laptops);
       
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

 const handleViewDetail = (product) => {
   setSelectedProduct(product);
   setCurrentView('detail');
 };

 const handleBackToCatalog = () => {
   setCurrentView('catalog');
   setSelectedProduct(null);
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

 if (currentView === 'detail') {
   return (
     <ProductDetail 
       product={selectedProduct} 
       onBack={handleBackToCatalog}
       cartHook={cartHook}
     />
   );
 }

 return (
   <CatalogView 
     products={products}
     onViewDetail={handleViewDetail}
     cartHook={cartHook}
   />
 );
}