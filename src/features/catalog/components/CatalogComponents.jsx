import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, ArrowUpDown, X, ChevronDown, Check, Settings, Eye, ShoppingCart, Minus, Plus, MessageCircle } from 'lucide-react';
import { useCart } from './CartContext';

const COLUMNAS = [
 { clave: 'id_product', etiqueta: 'ID', mostrarPorDefecto: true, ancho: 0.5 },
 { clave: 'image', etiqueta: 'Imagen', mostrarPorDefecto: true, ancho: 1.2 },
 { clave: 'name', etiqueta: 'Nombre', mostrarPorDefecto: true, ancho: 2 },
 { clave: 'brand', etiqueta: 'Marca', mostrarPorDefecto: true, ancho: 1 },
 { clave: 'faction', etiqueta: 'Facción', mostrarPorDefecto: true, ancho: 1 },
 { clave: 'era', etiqueta: 'Era', mostrarPorDefecto: true, ancho: 1.2 },
 { clave: 'planet_origin', etiqueta: 'Planeta', mostrarPorDefecto: false, ancho: 1 },
 { clave: 'character_related', etiqueta: 'Personaje', mostrarPorDefecto: true, ancho: 1.2 },
 { clave: 'material', etiqueta: 'Material', mostrarPorDefecto: false, ancho: 1 },
 { clave: 'price_offer', etiqueta: 'Precio', mostrarPorDefecto: true, ancho: 0.5 },
 { clave: 'actions', etiqueta: 'Acciones', mostrarPorDefecto: true, ancho: 1.2 }
];

const useClickOutside = (callback) => {
 const ref = useRef();
 useEffect(() => {
   const handleClick = (e) => {
     if (ref.current && !ref.current.contains(e.target)) callback();
   };
   document.addEventListener('mousedown', handleClick);
   return () => document.removeEventListener('mousedown', handleClick);
 }, [callback]);
 return ref;
};

const Checkbox = ({ checked, onClick, children, className = "" }) => (
 <div className={`flex items-center px-2 py-1 rounded-md cursor-pointer hover:bg-[#161B22] transition-colors ${className}`} onClick={onClick}>
   <div className={`w-3 h-3 mr-2 flex items-center justify-center rounded border ${checked ? 'bg-blue-500 border-blue-500' : 'bg-[#0D1117] border-[#313840]'}`}>
     {checked && <Check size={8} className="text-white" />}
   </div>
   <span className={`text-xs ${children === 'Seleccionar todo' ? 'font-medium text-[#F9FCFF]' : 'text-gray-400'}`}>{children}</span>
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
       onClick={() => setAbierto(!abierto)}
       className="flex items-center justify-between w-full px-2 py-1 rounded-md text-sm truncate bg-[#0D1117] border border-[#313840] text-[#F9FCFF]"
     >
       <span className="truncate text-xs">
         {seleccionados.length === 0 ? etiqueta : `${etiqueta} (${seleccionados.length})`}
       </span>
       <ChevronDown size={14} />
     </button>
     
     {abierto && (
       <div className="absolute z-10 mt-1 w-48 rounded-md shadow-lg max-h-60 overflow-auto bg-[#0D1117] border border-[#313840]">
         <div className="p-1">
           <div className="p-1 sticky top-0 bg-[#0D1117]">
             <div className="relative">
               <Search size={12} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
               <input 
                 value={busquedaLocal} 
                 onChange={(e) => setBusquedaLocal(e.target.value)}
                 placeholder="Buscar..." 
                 className="w-full pl-6 pr-2 py-1 rounded-md text-xs bg-[#0D1117] border border-[#313840] text-[#F9FCFF]"
               />
             </div>
           </div>
           
           {opcionesFiltradas.length > 0 && (
             <div className="border-b mb-1 border-[#21262D]">
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
       onClick={() => setAbierto(!abierto)}
       className="flex items-center justify-center px-2 py-1 rounded-md bg-[#212830] hover:bg-[#2F3349] border border-[#313840]" 
       title="Configurar columnas"
     >
       <Settings size={16} />
     </button>
     
     {abierto && (
       <div className="absolute right-0 z-10 mt-1 w-48 rounded-md shadow-lg bg-[#0D1117] border border-[#313840]">
         <div className="p-2 text-xs">
           <div className="font-bold mb-1 text-[#F9FCFF]">Mostrar columnas:</div>
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

// Placeholder inline (data-URI) para no pegarle a dominios externos que cuelgan.
const NO_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#e9e5db"/></svg>'
  );

const ProductImage = ({ product }) => {
 const imageUrl = product.main_image || (product.images && (product.images[0]?.url || product.images[0]?.image));

 return (
   <img
     src={imageUrl || NO_IMAGE}
     alt={product.name || 'Producto'}
     className="w-20 h-20 object-cover rounded-md"
     loading="lazy"
     onError={(e) => { e.target.src = NO_IMAGE; }}
   />
 );
};

const CartButton = ({ product, cartHook }) => {
 const [showLoginAlert, setShowLoginAlert] = useState(false);
 const { updateCartCount } = useCart();
 
 const { isInCart, quantity } = useMemo(() => {
   try {
     if (!cartHook?.cartData?.salesorderline_set) return { isInCart: false, quantity: 0 };
     
     const line = cartHook.cartData.salesorderline_set.find(
       line => line.product === product.id_product && !line.pull
     );
     
     return {
       isInCart: !!line,
       quantity: line ? parseInt(line.product_qty) || 0 : 0
     };
   } catch (error) {
     console.error('Error reading cart data:', error);
     return { isInCart: false, quantity: 0 };
   }
 }, [cartHook?.cartData, product.id_product]);

 const handleCartAction = async (action) => {
   try {
     if (!cartHook?.updateCartQuantity) return;
     
     let newQuantity = quantity;
     if (action === 'toggle') newQuantity = isInCart ? 0 : 1;
     else if (action === 'increase') newQuantity = quantity + 1;
     else if (action === 'decrease') newQuantity = quantity - 1;
     
     await cartHook.updateCartQuantity(product.id_product, newQuantity, product.price_offer);
     updateCartCount();
   } catch (error) {
     console.error('Error en cart action:', error);
     if (error?.message?.includes('401') || error?.status === 401 || error?.response?.status === 401) {
       setShowLoginAlert(true);
     }
   }
 };

 if (showLoginAlert) {
   return (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
       <div className="bg-[#0D1117] p-6 rounded-lg shadow-xl max-w-md mx-4">
         <h3 className="text-lg font-bold text-[#F9FCFF] mb-4">Debe loguearse primero</h3>
         <p className="text-gray-400 mb-6">Para agregar productos al carrito, necesitas iniciar sesión.</p>
         <div className="flex gap-3">
           <button 
             onClick={() => window.open('https://armalo.com/login', '_blank')}
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
   <div className="flex items-center justify-center">
     {!isInCart ? (
       <button 
         className="flex items-center justify-center gap-2 px-3 py-1.5 bg-[#212830] hover:bg-[#2F3349] text-[#F9FCFF] rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
         onClick={() => handleCartAction('toggle')}
         disabled={cartHook?.loading}
       >
         <ShoppingCart size={14} />
         {cartHook?.loading ? 'Cargando...' : 'Agregar'}
       </button>
     ) : (
       <div className="flex items-center gap-1 bg-gradient-to-r from-[#212830] to-[#2F3349] rounded-lg p-1 shadow-md">
         <button 
           className="flex items-center justify-center w-6 h-6 rounded-md bg-[#161B22] hover:bg-[#21262D] text-[#F9FCFF] transition-colors"
           onClick={() => handleCartAction('decrease')}
           disabled={cartHook?.loading}
         >
           <Minus size={10} />
         </button>
         <span className="text-xs font-bold text-[#F9FCFF] px-1 min-w-[20px] text-center">{quantity}</span>
         <button 
           className="flex items-center justify-center w-6 h-6 rounded-md bg-[#161B22] hover:bg-[#21262D] text-[#F9FCFF] transition-colors"
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

const ActionButtons = ({ product, onViewDetail }) => (
 <div className="flex items-center gap-1">
   <button 
     onClick={() => {
       const message = `Hola! Me interesa este producto:%0A%0A*id: ${product.id_product}*%0A*Nombre: ${product.name}*%0APrecio: S/${product.price_offer}%0A%0A¿Podrías darme más información?`;
       window.open(`https://wa.me/51956787186?text=${message}`, '_blank');
     }}
     className="flex items-center justify-center w-7 h-7 rounded-full bg-[#212830] hover:bg-[#2F3349] text-[#F9FCFF] transition-all duration-200 hover:scale-105"
     title="Consultar por WhatsApp"
   >
     <MessageCircle size={12} />
   </button>
   <button 
     onClick={() => onViewDetail(product)}
     className="flex items-center justify-center w-7 h-7 rounded-full bg-[#212830] hover:bg-[#2F3349] text-[#F9FCFF] transition-all duration-200 hover:scale-105"
     title="Ver detalles"
   >
     <Eye size={12} />
   </button>
 </div>
);

const ProductActions = ({ product, cartHook, onViewDetail }) => (
 <div className="flex flex-col items-center gap-2 p-1">
   <CartButton product={product} cartHook={cartHook} />
   <ActionButtons product={product} onViewDetail={onViewDetail} />
 </div>
);

export const CatalogView = ({ products, onViewDetail, cartHook }) => {
 const [busquedaInput, setBusquedaInput] = useState('');
 const [busqueda, setBusqueda] = useState('');
 const debounceRef = useRef(null);
 const [multiSelectFilters, setMultiSelectFilters] = useState({});
 const [orden, setOrden] = useState({ clave: 'name', direccion: 'asc' });
 const [opcionesFiltros, setOpcionesFiltros] = useState({});
 const [columnasVisibles, setColumnasVisibles] = useState(
   COLUMNAS.filter(col => col.mostrarPorDefecto).map(col => col.clave)
 );

 useEffect(() => {
   const opcionesObj = {};
   COLUMNAS.forEach(({ clave }) => {
     if (clave !== 'actions' && clave !== 'image') {
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
   if (clave === 'actions' || clave === 'image') return;
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
       if (orden.clave === 'actions' || orden.clave === 'image') return 0;
       const valorA = a[orden.clave] || '';
       const valorB = b[orden.clave] || '';
       
       if (orden.clave === 'price_offer') {
         const numA = parseFloat(valorA) || 0;
         const numB = parseFloat(valorB) || 0;
         return orden.direccion === 'asc' ? numA - numB : numB - numA;
       }
       
       const comparison = String(valorA).localeCompare(String(valorB));
       return orden.direccion === 'asc' ? comparison : -comparison;
     });
 }, [products, busqueda, multiSelectFilters, orden]);

 useEffect(() => () => clearTimeout(debounceRef.current), []);

 const limpiarFiltros = () => {
   setBusquedaInput('');
   setBusqueda('');
   setMultiSelectFilters({});
 };

 return (
   <div className="min-h-screen p-1 bg-[#010409] text-[#F9FCFF]">
     <div className="max-w-screen-xl mx-auto">
       <div className="flex justify-between items-center mb-3">
         <ColumnSelector 
           columnas={COLUMNAS} 
           columnasVisibles={columnasVisibles} 
           onChange={setColumnasVisibles} 
         />
       </div>
       
       <div className="mb-3 p-2 rounded-lg bg-[#0D1117]">
         <div className="flex flex-wrap items-center gap-2 mb-2">
           <div className="relative flex-grow">
             <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
             <input
               value={busquedaInput}
               onChange={(e) => {
                 setBusquedaInput(e.target.value);
                 clearTimeout(debounceRef.current);
                 debounceRef.current = setTimeout(() => setBusqueda(e.target.value), 400);
               }}
               placeholder="Buscar..."
               className="w-full pl-8 pr-2 py-1 rounded-md text-sm bg-[#0D1117] border border-[#313840] text-[#F9FCFF]"
             />
           </div>
           
           <button 
             onClick={limpiarFiltros}
             className="flex-shrink-0 flex items-center justify-center px-2 py-1 rounded-md text-xs bg-[#212830] hover:bg-[#2F3349]"
           >
             <X size={14} className="mr-1" />
             Reset
           </button>
         </div>
         
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 mt-2">
           {COLUMNAS
             .filter(col => columnasVisibles.includes(col.clave) && col.clave !== 'actions' && col.clave !== 'image')
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
         Mostrando <span className="font-bold">{productsFiltrados.length}</span> de <span className="font-bold">{products.length}</span> piezas
       </div>

       <div className="hidden sm:block overflow-x-auto rounded-lg w-full bg-[#0D1117]">
         <table className="w-full text-xs">
           <thead>
             <tr className="bg-[#161B22] border-b border-[#21262D]">
               {COLUMNAS.filter(col => columnasVisibles.includes(col.clave)).map(({ clave, etiqueta }) => (
                 <th 
                   key={clave} 
                   className={`px-1 py-2 text-left font-medium text-xs uppercase tracking-wide text-gray-400 ${clave !== 'actions' && clave !== 'image' ? 'cursor-pointer' : ''}`}
                   onClick={() => cambiarOrden(clave)} 
                   style={{ width: calcularAnchoColumna(clave) }}
                 >
                   <div className="flex items-center">
                     <span className="truncate">{etiqueta}</span>
                     {clave !== 'actions' && clave !== 'image' && <ArrowUpDown size={12} className="ml-1 flex-shrink-0" />}
                   </div>
                 </th>
               ))}
             </tr>
           </thead>
           <tbody>
             {productsFiltrados.length === 0 ? (
               <tr>
                 <td colSpan={columnasVisibles.length} className="px-2 py-4 text-center">
                   No se encontraron piezas
                 </td>
               </tr>
             ) : (
               productsFiltrados.map(product => (
                 <tr 
                   key={product.id_product} 
                   className="border-t border-[#21262D] hover:bg-[#161B22] transition-colors"
                 >
                   {COLUMNAS.filter(col => columnasVisibles.includes(col.clave)).map(({ clave }) => (
                     <td key={`${product.id_product}-${clave}`} className="px-1 py-2">
                       <div className="break-words">
                         {clave === 'actions' ? (
                           <ProductActions product={product} cartHook={cartHook} onViewDetail={onViewDetail} />
                         ) : clave === 'image' ? (
                           <ProductImage product={product} />
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
           <div className="p-4 text-center rounded-lg bg-[#0D1117]">
             No se encontraron piezas
           </div>
         ) : (
           productsFiltrados.map(product => (
             <div 
               key={product.id_product} 
               className="rounded-lg shadow-sm bg-[#0D1117] border border-[#313840] overflow-hidden"
             >
               <div className="p-3">
                 <div className="flex gap-3 mb-3">
                   {columnasVisibles.includes('image') && (
                     <div className="flex-shrink-0">
                       <ProductImage product={product} />
                     </div>
                   )}
                   <div className="flex-1 min-w-0">
                     <button 
                       onClick={() => onViewDetail(product)}
                       className="font-medium text-sm text-left w-full hover:text-blue-400 transition-colors text-blue-500 leading-tight mb-2 block"
                     >
                       {product.name || '-'}
                     </button>
                     <div className="text-xs text-gray-400 mb-2">
                       <span className="inline-block mr-3">ID: {product.id_product}</span>
                       <span className="inline-block font-medium text-red-500">Precio: S/{product.price_offer}</span>
                     </div>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-3 text-xs">
                   {COLUMNAS
                     .filter(col => columnasVisibles.includes(col.clave) && 
                             !['name', 'actions', 'image', 'id_product', 'price_offer'].includes(col.clave))
                     .map(({ clave, etiqueta }) => (
                       <div key={`${product.id_product}-${clave}`}>
                         <span className="text-gray-400">{etiqueta}:</span>{' '}
                         <span className="font-medium text-[#F9FCFF]">
                           {product[clave] || '-'}
                         </span>
                       </div>
                     ))
                   }
                 </div>
                 
                 {columnasVisibles.includes('actions') && (
                   <div className="border-t border-[#313840] pt-3 mt-3 flex justify-center">
                     <ProductActions product={product} cartHook={cartHook} onViewDetail={onViewDetail} />
                   </div>
                 )}
               </div>
             </div>
           ))
         )}
       </div>
     </div>
   </div>
 );
};

export default function Demo() {
 const handleViewDetail = (product) => {
   console.log('Ver detalles:', product);
   alert(`Viendo detalles de: ${product.name}\nPrecio: $${product.price_offer}\nMarca: ${product.brand}`);
 };

 const products = [];

 return (
   <CatalogView 
     products={products}
     onViewDetail={handleViewDetail}
     cartHook={null}
   />
 );
}

export { COLUMNAS };