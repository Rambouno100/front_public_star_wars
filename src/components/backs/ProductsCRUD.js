import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { Plus, Save, X, Search, Upload, Trash2, ImageIcon, ChevronUp, ChevronDown, GripVertical, Edit, Eye, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../App';

const useDebounce = (value, delay) => {
 const [debouncedValue, setDebouncedValue] = useState(value);
 useEffect(() => {
   const handler = setTimeout(() => setDebouncedValue(value), delay);
   return () => clearTimeout(handler);
 }, [value, delay]);
 return debouncedValue;
};

const normalizeOption = (option, index) => {
 try {
   if (typeof option === 'object' && option !== null) {
     if (option.value !== undefined && option.display_name !== undefined) {
       return { value: option.value, label: option.display_name };
     }
     if (option.value !== undefined && option.label !== undefined) {
       return { value: option.value, label: option.label };
     }
     if (Array.isArray(option) && option.length >= 2) {
       return { value: option[0], label: option[1] };
     }
     const keys = Object.keys(option);
     return { value: option[keys[0]], label: option[keys[1]] || option[keys[0]] };
   }
   if (Array.isArray(option) && option.length >= 2) {
     return { value: option[0], label: option[1] };
   }
   return { value: option, label: option };
 } catch {
   return { value: `error_${index}`, label: 'Error en opción' };
 }
};

const ImageManager = ({ images = [], productId, onImageChange, newImages = [], onNewImagesChange }) => {
 const [uploading, setUploading] = useState(false);

 const handleImageUpload = async (files) => {
   if (!files.length) return;
   setUploading(true);
   const validImages = [];

   for (const file of files) {
     if (file.size > 5 * 1024 * 1024) {
       alert(`${file.name} es muy grande. Máximo 5MB.`);
       continue;
     }
     if (!file.type.startsWith('image/')) {
       alert(`${file.name} no es una imagen válida.`);
       continue;
     }
     validImages.push({
       file,
       preview: URL.createObjectURL(file),
       name: file.name,
       order: newImages.length + validImages.length + 1,
       isNew: true
     });
   }

   onNewImagesChange([...newImages, ...validImages]);
   setUploading(false);
 };

 const removeNewImage = (index) => {
   const updatedImages = [...newImages];
   if (updatedImages[index].preview) {
     URL.revokeObjectURL(updatedImages[index].preview);
   }
   updatedImages.splice(index, 1);
   onNewImagesChange(updatedImages.map((img, idx) => ({ ...img, order: idx + 1 })));
 };

 const deleteExistingImage = async (imageId) => {
   if (!window.confirm('¿Seguro que deseas eliminar esta imagen?')) return;
   try {
     const token = localStorage.getItem('accessToken');
     await axios.delete(`${process.env.REACT_APP_API_URL}/images/${imageId}/`, {
       headers: { 'Authorization': `Bearer ${token}` }
     });
     onImageChange?.();
   } catch (error) {
     console.error('Error deleting image:', error);
     alert('Error al eliminar la imagen');
   }
 };

 const moveNewImage = (fromIndex, toIndex) => {
   if (toIndex < 0 || toIndex >= newImages.length) return;
   const updatedImages = [...newImages];
   const [movedImage] = updatedImages.splice(fromIndex, 1);
   updatedImages.splice(toIndex, 0, movedImage);
   onNewImagesChange(updatedImages.map((img, idx) => ({ ...img, order: idx + 1 })));
 };

 useEffect(() => {
   return () => {
     newImages.forEach(img => {
       if (img.preview) URL.revokeObjectURL(img.preview);
     });
   };
 }, []);

 return (
   <div className="space-y-6">
     <div className="flex items-center justify-between">
       <h4 className="text-lg font-medium text-[#F9FCFF]">Imágenes del Producto</h4>
       <label className="bg-[#212830] hover:bg-[#2F3349] border border-[#313840] text-[#F9FCFF] px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
         <Upload size={16} />
         {uploading ? 'Subiendo...' : 'Agregar Imágenes'}
         <input
           type="file"
           multiple
           accept="image/*"
           className="hidden"
           onChange={(e) => handleImageUpload(Array.from(e.target.files))}
           disabled={uploading}
         />
       </label>
     </div>

     {images.length > 0 && (
       <div>
         <h5 className="text-md font-medium text-gray-400 mb-3">Imágenes Actuales</h5>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {images
             .sort((a, b) => (a.order || 0) - (b.order || 0))
             .map((image) => (
               <div key={image.id} className="relative group">
                 <img
                   src={image.image}
                   alt={image.alt_text || 'Product image'}
                   className="w-full h-24 object-cover rounded-lg border border-[#313840] bg-[#0D1117]"
                 />
                 <div className="absolute top-1 left-1 bg-blue-600 text-[#F9FCFF] text-xs px-2 py-1 rounded">
                   #{image.order || 1}
                 </div>
                 <button
                   onClick={() => deleteExistingImage(image.id)}
                   className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-[#F9FCFF] rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                   <Trash2 size={12} />
                 </button>
                 {image.is_main && (
                   <div className="absolute bottom-1 left-1 bg-green-600 text-[#F9FCFF] text-xs px-1 rounded">
                     Principal
                   </div>
                 )}
               </div>
             ))}
         </div>
       </div>
     )}

     {newImages.length > 0 && (
       <div>
         <h5 className="text-md font-medium text-gray-400 mb-3">
           Nuevas Imágenes ({newImages.length})
         </h5>
         <div className="space-y-3">
           {newImages
             .sort((a, b) => a.order - b.order)
             .map((image, index) => (
               <div
                 key={index}
                 className="flex items-center gap-4 p-3 bg-[#0D1117] rounded-lg border border-[#313840]"
               >
                 <div className="cursor-move text-gray-400">
                   <GripVertical size={20} />
                 </div>
                 
                 <img
                   src={image.preview}
                   alt={image.name}
                   className="w-16 h-16 object-cover rounded border border-[#313840]"
                 />
                 
                 <div className="flex-1">
                   <p className="text-[#F9FCFF] text-sm font-medium truncate">{image.name}</p>
                   <p className="text-gray-400 text-xs">
                     {(image.file.size / 1024 / 1024).toFixed(2)} MB
                   </p>
                 </div>
                 
                 <div className="flex items-center gap-2">
                   <label className="text-xs text-gray-400">Orden:</label>
                   <input
                     type="number"
                     min="1"
                     value={image.order}
                     onChange={(e) => {
                       const orderNum = parseInt(e.target.value);
                       if (!isNaN(orderNum) && orderNum >= 1) {
                         const updatedImages = [...newImages];
                         updatedImages[index] = { ...updatedImages[index], order: orderNum };
                         onNewImagesChange(updatedImages);
                       }
                     }}
                     className="w-16 px-2 py-1 bg-[#010409] border border-[#313840] rounded text-[#F9FCFF] text-sm text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                   />
                 </div>
                 
                 <div className="flex flex-col gap-1">
                   <button
                     type="button"
                     onClick={() => moveNewImage(index, index - 1)}
                     disabled={index === 0}
                     className="p-1 text-gray-400 hover:text-[#F9FCFF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                   >
                     <ChevronUp size={16} />
                   </button>
                   <button
                     type="button"
                     onClick={() => moveNewImage(index, index + 1)}
                     disabled={index === newImages.length - 1}
                     className="p-1 text-gray-400 hover:text-[#F9FCFF] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                   >
                     <ChevronDown size={16} />
                   </button>
                 </div>
                 
                 <button
                   type="button"
                   onClick={() => removeNewImage(index)}
                   className="p-2 bg-red-600 hover:bg-red-700 text-[#F9FCFF] rounded-full transition-colors"
                 >
                   <Trash2 size={14} />
                 </button>
               </div>
             ))}
         </div>
       </div>
     )}

     {images.length === 0 && newImages.length === 0 && (
       <div className="border-2 border-dashed border-[#313840] rounded-lg p-8 text-center bg-[#0D1117]">
         <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
         <p className="text-gray-400 mb-2">No hay imágenes</p>
         <p className="text-gray-500 text-sm">
           Haz clic en "Agregar Imágenes" para subir imágenes de tu producto
         </p>
       </div>
     )}
   </div>
 );
};

const ProductsTable = ({ products, loading, onEdit, onDelete, search }) => {
 const [expandedRows, setExpandedRows] = useState(new Set());

 const toggleRow = (id) => {
   const newExpanded = new Set(expandedRows);
   if (newExpanded.has(id)) {
     newExpanded.delete(id);
   } else {
     newExpanded.add(id);
   }
   setExpandedRows(newExpanded);
 };

 if (loading) {
   return (
     <div className="bg-[#0D1117] border border-[#313840] rounded-lg p-8">
       <div className="text-center text-gray-400">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
         Cargando productos...
       </div>
     </div>
   );
 }

 if (products.length === 0) {
   return (
     <div className="bg-[#0D1117] border border-[#313840] rounded-lg p-8">
       <div className="text-center text-gray-400">
         <Search size={48} className="mx-auto mb-4 opacity-50" />
         <p className="text-lg mb-2">No hay productos</p>
         <p className="text-sm">
           {search ? `No se encontraron productos para "${search}"` : 'Comienza agregando tu primer producto'}
         </p>
       </div>
     </div>
   );
 }

 return (
   <div className="bg-[#0D1117] border border-[#313840] rounded-lg overflow-hidden">
     <div className="overflow-x-auto">
       <table className="w-full">
         <thead className="bg-[#161B22]">
           <tr>
             <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
               <div className="w-6"></div>
             </th>
             <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
               Producto
             </th>
             <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
               Precio
             </th>
             <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
               Stock
             </th>
             <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
               Categoría
             </th>
             <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
               Estado
             </th>
             <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">
               Acciones
             </th>
           </tr>
         </thead>
         <tbody className="divide-y divide-[#21262D]">
           {products.map((product) => {
             const isExpanded = expandedRows.has(product.id_product || product.id);
             const productId = product.id_product || product.id;
             
             return (
               <React.Fragment key={productId}>
                 <tr className="hover:bg-[#161B22] transition-colors">
                   <td className="px-4 py-3">
                     <button
                       onClick={() => toggleRow(productId)}
                       className="text-gray-400 hover:text-[#F9FCFF] transition-colors"
                     >
                       <ChevronRight 
                         size={16} 
                         className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                       />
                     </button>
                   </td>
                   <td className="px-4 py-3">
                     <div className="flex items-center space-x-3">
                       {product.images && product.images.length > 0 ? (
                         <img
                           src={product.images.find(img => img.is_main)?.image || product.images[0]?.image}
                           alt={product.name}
                           className="w-10 h-10 rounded-lg object-cover border border-[#313840]"
                         />
                       ) : (
                         <div className="w-10 h-10 bg-[#212830] border border-[#313840] rounded-lg flex items-center justify-center">
                           <ImageIcon size={16} className="text-gray-400" />
                         </div>
                       )}
                       <div>
                         <p className="text-[#F9FCFF] font-medium truncate max-w-xs">
                           {product.name}
                         </p>
                         {product.model && (
                           <p className="text-gray-400 text-sm truncate max-w-xs">
                             {product.model}
                           </p>
                         )}
                       </div>
                     </div>
                   </td>
                   <td className="px-4 py-3">
                     <div>
                       <p className="text-[#F9FCFF] font-medium">
                         S/{product.price ? parseFloat(product.price).toLocaleString() : 'N/A'}
                       </p>
                       {product.price_offer_bank && (
                         <p className="text-green-400 text-sm">
                           Oferta: S/{parseFloat(product.price_offer_bank).toLocaleString()}
                         </p>
                       )}
                     </div>
                   </td>
                   <td className="px-4 py-3">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                       (product.stock || 0) > 5 
                         ? 'bg-green-900 text-green-300' 
                         : (product.stock || 0) > 0 
                           ? 'bg-yellow-900 text-yellow-300'
                           : 'bg-red-900 text-red-300'
                     }`}>
                       {product.stock || 0} unidades
                     </span>
                   </td>
                   <td className="px-4 py-3">
                     <span className="text-gray-400">
                       {product.category || product.type || 'Sin categoría'}
                     </span>
                   </td>
                   <td className="px-4 py-3">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                       product.condition === 'Nuevo' 
                         ? 'bg-blue-900 text-blue-300'
                         : 'bg-gray-700 text-gray-300'
                     }`}>
                       {product.condition || 'N/A'}
                     </span>
                   </td>
                   <td className="px-4 py-3">
                     <div className="flex items-center space-x-2 justify-end">
                       <button
                         onClick={() => onEdit(product)}
                         className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                         title="Editar producto"
                       >
                         <Edit size={16} />
                       </button>
                       <button
                         onClick={() => onDelete(productId)}
                         className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                         title="Eliminar producto"
                       >
                         <Trash2 size={16} />
                       </button>
                     </div>
                   </td>
                 </tr>
                 
                 {isExpanded && (
                   <tr>
                     <td colSpan={7} className="px-4 py-4 bg-[#010409] border-t border-[#21262D]">
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                         {Object.entries(product)
                           .filter(([key, value]) => 
                             !['id_product', 'id', 'images', 'created_at', 'updated_at', 'name', 'price', 'stock', 'category', 'type', 'condition'].includes(key) &&
                             value !== null && value !== undefined && value !== ''
                           )
                           .map(([key, value]) => (
                             <div key={key} className="space-y-1">
                               <p className="text-gray-400 font-medium capitalize">
                                 {key.replace(/_/g, ' ')}:
                               </p>
                               <p className="text-[#F9FCFF]">
                                 {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                               </p>
                             </div>
                           ))}
                       </div>
                       
                       {product.description && (
                         <div className="mt-4 pt-4 border-t border-[#21262D]">
                           <p className="text-gray-400 font-medium mb-2">Descripción:</p>
                           <p className="text-[#F9FCFF] text-sm leading-relaxed">
                             {product.description}
                           </p>
                         </div>
                       )}
                       
                       {product.images && product.images.length > 1 && (
                         <div className="mt-4 pt-4 border-t border-[#21262D]">
                           <p className="text-gray-400 font-medium mb-3">Todas las imágenes:</p>
                           <div className="flex space-x-2 overflow-x-auto">
                             {product.images
                               .sort((a, b) => (a.order || 0) - (b.order || 0))
                               .map((image, index) => (
                                 <img
                                   key={image.id || index}
                                   src={image.image}
                                   alt={image.alt_text || `Image ${index + 1}`}
                                   className="w-16 h-16 rounded-lg object-cover border border-[#313840] flex-shrink-0"
                                 />
                               ))}
                           </div>
                         </div>
                       )}
                     </td>
                   </tr>
                 )}
               </React.Fragment>
             );
           })}
         </tbody>
       </table>
     </div>
   </div>
 );
};

const ProductsCRUD = () => {
 const { isAuthenticated, logout } = useContext(AuthContext);
 const [products, setProducts] = useState([]);
 const [loading, setLoading] = useState(false);
 const [editing, setEditing] = useState(null);
 const [showForm, setShowForm] = useState(false);
 const [error, setError] = useState(null);
 const [search, setSearch] = useState('');
 const [formData, setFormData] = useState({});
 const [newImages, setNewImages] = useState([]);
 const [fieldChoices, setFieldChoices] = useState({});
 const [activeTab, setActiveTab] = useState('general');
 
 const debouncedSearch = useDebounce(search, 300);

 const fieldTabs = {
   general: {
     name: 'General',
     fields: ['name', 'price', 'condition', 'price_offer_bank', 'salestart', 'saleend', 'manufacture_year', 'type', 'category', 'stock', 'description','score','purpose','approved']
   },
   laptops: {
     name: 'Laptops',
     fields: ['brand', 'cpu', 'cpu_brand', 'processor_cores', 'gpu', 'storage_capacity', 'ram', 'screen_size', 'screen_resolution', 'model', 'os']
   },
   dimensions: {
     name: 'Dimensiones',
     fields: ['weight', 'width', 'length', 'height']
   },
   advanced: {
     name: 'Avanzado',
     fields: ['cost', 'profit', 'core_count', 'storage', 'id_supplier', 'rating', 'tdp', 'performance_clock', 'socket', 'form_factor', 'max_ram', 'memory_slots', 'speed', 'modules', 'cas_latency', 'capacity', 'interface', 'chipset', 'memory', 'core_clock', 'category_falabella']
   }
 };

  const api = useCallback(async (method, url, data = null, isFormData = false) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');

      const headers = { 'Authorization': `Bearer ${token}` };
      
      // ✅ CORRECCIÓN: No establecer Content-Type para FormData
      // El navegador lo establecerá automáticamente con el boundary correcto
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }
      
      return await axios({ 
        method, 
        url: `${process.env.REACT_APP_API_URL}${url}`, 
        headers, 
        data 
      });
    } catch (error) {
      if (error.response?.status === 401) logout();
      throw error;
    }
  }, [logout]);

 const loadFieldChoices = useCallback(async () => {
   try {
     const response = await api('options', '/products/');
     const choices = {};
     const postActions = response.data?.actions?.POST || {};
     
     Object.entries(postActions).forEach(([field, config]) => {
       if (config.choices && Array.isArray(config.choices) && config.choices.length > 0) {
         choices[field] = {
           options: config.choices,
           label: config.label || formatFieldName(field)
         };
       }
     });
     
     setFieldChoices(choices);
   } catch (error) {
     console.error('Error loading field choices:', error);
     setFieldChoices({});
   }
 }, [api]);

 const loadProducts = useCallback(async () => {
   try {
     setLoading(true);
     const response = await api('get', '/products/');
     setProducts(response.data.results || response.data);
   } catch (error) {
     console.error('Error loading products:', error);
     setError('Error al cargar productos');
   } finally {
     setLoading(false);
   }
 }, [api]);

const saveProduct = async (e) => {
  e.preventDefault();
  const isEdit = editing?.id_product || editing?.id;
  
  try {
    setError(null);
    
    const requiredFields = ['name', 'type'];
    const missingFields = requiredFields.filter(field => !formData[field]?.trim());
    
    if (missingFields.length > 0) {
      setError(`Campos requeridos: ${missingFields.join(', ')}`);
      return;
    }
    
    let response;
    
    if (newImages.length > 0) {
      // ✅ Usar el método alternativo directamente que funciona mejor
      await saveProductAlternative(isEdit);
      return;
    } else {
      // Sin imágenes, enviar JSON normal
      response = await api(
        isEdit ? 'put' : 'post', 
        isEdit ? `/products/${isEdit}/` : '/products/', 
        formData,
        false
      );
    }
    
    await loadProducts();
    resetForm();
    
  } catch (error) {
    console.error('Error saving product:', error);
    
    const errorMsg = error.response?.data;
    if (typeof errorMsg === 'object') {
      const errors = Object.entries(errorMsg)
        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
        .join('; ');
      setError(`Error: ${errors}`);
    } else {
      setError(isEdit ? 'Error al actualizar producto' : 'Error al crear producto');
    }
  }
};

const saveProductAlternative = async (isEdit) => {
  // Primero crear/actualizar el producto sin imágenes
  const productResponse = await api(
    isEdit ? 'put' : 'post', 
    isEdit ? `/products/${isEdit}/` : '/products/', 
    formData,
    false
  );
  
  const productId = productResponse.data.id_product || productResponse.data.id;
  
  // Luego agregar las imágenes una por una si hay un productId válido
  if (newImages.length > 0 && productId) {
    const orderedImages = [...newImages].sort((a, b) => a.order - b.order);
    
    try {
      for (let i = 0; i < orderedImages.length; i++) {
        const imageData = orderedImages[i];
        const imageFormData = new FormData();
        
        imageFormData.append('image', imageData.file);
        imageFormData.append('order', imageData.order.toString());
        imageFormData.append('alt_text', imageData.name || '');
        imageFormData.append('is_main', imageData.order === 1 ? 'true' : 'false');
        
        await api('post', `/products/${productId}/images/`, imageFormData, true);
      }
    } catch (imageError) {
      console.error('Error uploading images:', imageError);
      // El producto se creó pero falló al subir imágenes
      setError('Producto guardado, pero hubo errores al subir algunas imágenes');
    }
  }
  
  await loadProducts();
  resetForm();
};

 const deleteProduct = useCallback(async (id) => {
   if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
   try {
     setError(null);
     await api('delete', `/products/${id}/`);
     await loadProducts();
   } catch (error) {
     setError('Error al eliminar producto');
     console.error('Error deleting product:', error);
   }
 }, [api, loadProducts]);

 const resetForm = useCallback(() => {
   newImages.forEach(img => {
     if (img.preview) URL.revokeObjectURL(img.preview);
   });
   
   setFormData({});
   setEditing(null);
   setShowForm(false);
   setNewImages([]);
   setActiveTab('general');
 }, [newImages]);

 const editProduct = useCallback((product) => {
   const cleanProduct = { ...product };
   ['id_product', 'id', 'created_at', 'updated_at', 'images'].forEach(key => delete cleanProduct[key]);
   
   setFormData(cleanProduct);
   setEditing(product);
   setShowForm(true);
   setNewImages([]);
   window.scrollTo({ top: 0, behavior: 'smooth' });
 }, []);

 const getFieldConfig = (key) => {
   const config = {
     type: 'text',
     options: null,
     required: ['name', 'type'].includes(key),
     validation: {}
   };

   if (fieldChoices[key]?.options) {
     config.type = 'select';
     config.options = fieldChoices[key].options;
     return config;
   }

  if (key.toLowerCase().includes('price') || key.toLowerCase().includes('cost')) {
     config.type = 'number';
     config.validation = { min: 0, step: 0.01 };
   } else if (key === 'stock' || key === 'core_count' || key === 'processor_cores') {
     config.type = 'number';
     config.validation = { min: 0, step: 1 };
   } else if (key === 'weight') {
     config.type = 'number';
     config.validation = { min: 0, step: 0.01 };
   } else if (key.toLowerCase().includes('date') || key === 'salestart' || key === 'saleend') {
     config.type = 'datetime-local';
   } else if (key === 'manufacture_year') {
     config.type = 'number';
     config.validation = { min: 1990, max: new Date().getFullYear() + 1 };
   } else if (key === 'description') {
     config.type = 'textarea';
   } else if (key.toLowerCase().includes('email')) {
     config.type = 'email';
   }

   return config;
 };

 const formatFieldName = (key) => {
   const translations = {
     'name': 'Nombre',
     'cost': 'Costo',
     'profit': 'Ganancia',
     'price': 'Precio',
     'type': 'Tipo',
     'category': 'Categoría',
     'cpu_brand': 'Marca Procesador',
     'storage_capacity': 'Capacidad Almacenamiento',
     'screen_resolution': 'Resolución',
     'description': 'Descripción',
     'stock': 'Stock',
     'os': 'Sistema Operativo',
     'condition': 'Condición',
     'processor_cores': 'Núcleos Procesador',
     'price_offer_bank': 'Precio Oferta',
     'salestart': 'Inicio Oferta',
     'saleend': 'Fin Oferta',
     'manufacture_year': 'Año Fabricación',
     'brand': 'Marca',
     'cpu': 'Procesador',
     'gpu': 'Tarjeta Gráfica',
     'ram': 'Memoria RAM',
     'screen_size': 'Tamaño Pantalla',
     'model': 'Modelo',
     'weight': 'Peso',
     'width': 'Ancho',
     'length': 'Largo',
     'height': 'Alto',
     'id_supplier': 'ID Proveedor'
   };
   
   return translations[key] || key
     .replace(/_/g, ' ')
     .replace(/([A-Z])/g, ' $1')
     .replace(/^./, str => str.toUpperCase())
     .trim();
 };

 const filteredProducts = useMemo(() => {
   if (!debouncedSearch) return products;
   return products.filter(product => 
     product && Object.values(product).some(value =>
       value && value.toString().toLowerCase().includes(debouncedSearch.toLowerCase())
     )
   );
 }, [products, debouncedSearch]);

 useEffect(() => {
   if (isAuthenticated) {
     loadProducts();
     loadFieldChoices();
   }
 }, [isAuthenticated, loadProducts, loadFieldChoices]);

 if (!isAuthenticated) {
   return (
     <div className="min-h-screen flex items-center justify-center bg-[#010409] text-[#F9FCFF]">
       <div className="text-center">
         <h2 className="text-2xl font-bold mb-4">Acceso Restringido</h2>
         <p className="text-gray-400">Debes iniciar sesión para acceder a esta página.</p>
       </div>
     </div>
   );
 }

 return (
   <div className="min-h-screen bg-[#010409] text-[#F9FCFF]">
     <div className="max-w-6xl mx-auto p-4">
       <div className="mb-8">
         <h1 className="text-3xl font-bold text-blue-400 mb-2">Gestión de Productos</h1>
         <p className="text-gray-400">Administra tu inventario ({products.length} productos)</p>
       </div>
       
       {error && (
         <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
           <p className="font-medium">Error:</p>
           <p className="text-sm">{error}</p>
         </div>
       )}

       <div className="flex flex-col sm:flex-row gap-4 mb-6">
         <button 
           onClick={() => setShowForm(!showForm)}
           className="bg-[#212830] hover:bg-[#2F3349] border border-[#313840] text-[#F9FCFF] px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
         >
           <Plus size={20} /> {showForm ? 'Cancelar' : 'Nuevo Producto'}
         </button>
         
         <div className="relative flex-1 max-w-md">
           <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
           <input 
             type="text" 
             value={search} 
             onChange={(e) => setSearch(e.target.value)}
             placeholder="Buscar productos..." 
             className="w-full pl-12 pr-4 py-3 bg-[#0D1117] border border-[#313840] rounded-lg text-[#F9FCFF] placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
           />
         </div>
       </div>

       {showForm && (
         <form onSubmit={saveProduct} className="bg-[#0D1117] border border-[#313840] rounded-lg p-6 mb-6">
           <h3 className="text-xl font-bold mb-6 text-blue-400">
             {editing ? 'Editar Producto' : 'Nuevo Producto'}
           </h3>
           
           <div className="flex border-b border-[#313840] mb-6">
             {Object.entries(fieldTabs).map(([key, tab]) => (
               <button
                 key={key}
                 type="button"
                 onClick={() => setActiveTab(key)}
                 className={`px-4 py-2 font-medium text-sm transition-colors ${
                   activeTab === key
                     ? 'text-blue-400 border-b-2 border-blue-400'
                     : 'text-gray-400 hover:text-[#F9FCFF]'
                 }`}
               >
                 {tab.name}
               </button>
             ))}
           </div>
           
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {fieldTabs[activeTab].fields.map(field => {
                 const config = getFieldConfig(field);
                 
                 return (
                   <div key={field} className={config.type === 'textarea' ? 'md:col-span-2 lg:col-span-3' : ''}>
                     <label className="block text-sm font-medium text-gray-400 mb-2">
                       {formatFieldName(field)} {config.required && <span className="text-red-400">*</span>}
                     </label>
                     
                     {config.type === 'select' ? (
                       <select
                         value={formData[field] || ''}
                         onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                         className="w-full px-4 py-3 bg-[#010409] border border-[#313840] rounded-lg text-[#F9FCFF] focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                         required={config.required}
                       >
                         <option value="">Seleccionar...</option>
                         {config.options?.map((option, index) => {
                           const normalized = normalizeOption(option, index);
                           return (
                             <option key={`${field}_${index}_${normalized.value}`} value={normalized.value}>
                               {normalized.label}
                             </option>
                           );
                         })}
                       </select>
                     ) : config.type === 'textarea' ? (
                       <textarea
                         value={formData[field] || ''}
                         onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                         className="w-full px-4 py-3 bg-[#010409] border border-[#313840] rounded-lg text-[#F9FCFF] focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-vertical transition-colors"
                         rows={3}
                         required={config.required}
                         placeholder={`Ingresa ${formatFieldName(field).toLowerCase()}`}
                       />
                     ) : (
                       <input
                         type={config.type}
                         value={formData[field] || ''}
                         onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                         className="w-full px-4 py-3 bg-[#010409] border border-[#313840] rounded-lg text-[#F9FCFF] focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                         required={config.required}
                         placeholder={`Ingresa ${formatFieldName(field).toLowerCase()}`}
                         {...config.validation}
                       />
                     )}
                   </div>
                 );
               })}
             </div>

             {activeTab === 'general' && (
               <div className="border-t border-[#313840] pt-6">
                 <ImageManager 
                   images={editing?.images || []}
                   productId={editing?.id_product}
                   onImageChange={loadProducts}
                   newImages={newImages}
                   onNewImagesChange={setNewImages}
                 />
               </div>
             )}
             
             <div className="flex gap-3 pt-4 border-t border-[#313840]">
               <button 
                 type="submit"
                 className="bg-green-600 hover:bg-green-700 text-[#F9FCFF] px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
               >
                 <Save size={18} /> {editing ? 'Actualizar' : 'Guardar'}
               </button>
               <button 
                 type="button" 
                 onClick={resetForm}
                 className="bg-[#212830] hover:bg-[#2F3349] border border-[#313840] text-[#F9FCFF] px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
               >
                 <X size={18} /> Cancelar
               </button>
             </div>
           </div>
         </form>
       )}

       <ProductsTable 
         products={filteredProducts}
         loading={loading}
         onEdit={editProduct}
         onDelete={deleteProduct}
         search={search}
       />
     </div>
   </div>
 );
};

export default ProductsCRUD;