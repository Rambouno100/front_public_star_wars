import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { Plus, Save, X, Search, Upload, Trash2, ImageIcon, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../App';
import ProductsTable from './ProductsTable';

// Hook para debounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// Normalizar opciones de select
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

// Componente de gestión de imágenes
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
      // Usar el endpoint correcto según tus URLs: /images/<image_id>/
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
        <h4 className="text-lg font-medium text-white">Imágenes del Producto</h4>
        <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
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

      {/* Imágenes existentes */}
      {images.length > 0 && (
        <div>
          <h5 className="text-md font-medium text-gray-300 mb-3">Imágenes Actuales</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.image}
                    alt={image.alt_text || 'Product image'}
                    className="w-full h-24 object-cover rounded-lg border border-gray-600"
                  />
                  <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    #{image.order || 1}
                  </div>
                  <button
                    onClick={() => deleteExistingImage(image.id)}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                  {image.is_main && (
                    <div className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-1 rounded">
                      Principal
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Nuevas imágenes */}
      {newImages.length > 0 && (
        <div>
          <h5 className="text-md font-medium text-gray-300 mb-3">
            Nuevas Imágenes ({newImages.length})
          </h5>
          <div className="space-y-3">
            {newImages
              .sort((a, b) => a.order - b.order)
              .map((image, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg border border-gray-700"
                >
                  <div className="cursor-move text-gray-400">
                    <GripVertical size={20} />
                  </div>
                  
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="w-16 h-16 object-cover rounded border border-gray-600"
                  />
                  
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium truncate">{image.name}</p>
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
                      className="w-16 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm text-center"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => moveNewImage(index, index - 1)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveNewImage(index, index + 1)}
                      disabled={index === newImages.length - 1}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {images.length === 0 && newImages.length === 0 && (
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
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
  
  const debouncedSearch = useDebounce(search, 300);

  // API Helper
  const api = useCallback(async (method, url, data = null, isFormData = false) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No token');

      const headers = { 'Authorization': `Bearer ${token}` };
      if (!isFormData) headers['Content-Type'] = 'application/json';
      
      return await axios({ method, url: `${process.env.REACT_APP_API_URL}${url}`, headers, data });
    } catch (error) {
      if (error.response?.status === 401) logout();
      throw error;
    }
  }, [logout]);

  // Cargar opciones de campos
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

  // Cargar productos
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

  // Guardar producto - VERSIÓN SIMPLIFICADA Y CORREGIDA
  const saveProduct = async (e) => {
    e.preventDefault();
    const isEdit = editing?.id_product || editing?.id;
    
    try {
      setError(null);
      
      // Validación básica
      const requiredFields = ['name', 'type'];
      const missingFields = requiredFields.filter(field => !formData[field]?.trim());
      
      if (missingFields.length > 0) {
        setError(`Campos requeridos: ${missingFields.join(', ')}`);
        return;
      }
      
      let response;
      
      if (newImages.length > 0) {
        // Con imágenes: usar FormData
        const formDataToSend = new FormData();
        
        // Agregar datos del producto
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
            formDataToSend.append(key, formData[key]);
          }
        });

        // Método corregido: usar la estructura que espera tu backend Django
        const orderedImages = [...newImages].sort((a, b) => a.order - b.order);
        
        // Tu backend espera 'image_files' como lista de archivos e 'image_orders' como lista de órdenes
        orderedImages.forEach((imageData) => {
          formDataToSend.append('image_files', imageData.file);
        });
        
        // Agregar órdenes como array separado
        orderedImages.forEach((imageData) => {
          formDataToSend.append('image_orders', imageData.order.toString());
        });
        
        response = await api(
          isEdit ? 'put' : 'post', 
          isEdit ? `/products/${isEdit}/` : '/products/', 
          formDataToSend,
          true
        );
      } else {
        // Sin imágenes: usar JSON
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
      
      // Si falla el método principal, intentar método alternativo
      if (error.response?.status === 400 && newImages.length > 0) {
        try {
          await saveProductAlternative(isEdit);
          return;
        } catch (altError) {
          console.error('Alternative method also failed:', altError);
        }
      }
      
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

  // Método alternativo: subir producto primero, luego imágenes por separado
  const saveProductAlternative = async (isEdit) => {
    console.log('Using alternative method: product first, then images separately');
    
    // 1. Guardar producto sin imágenes
    const productResponse = await api(
      isEdit ? 'put' : 'post', 
      isEdit ? `/products/${isEdit}/` : '/products/', 
      formData,
      false
    );
    
    // 2. Subir imágenes una por una usando el endpoint correcto
    const productId = productResponse.data.id_product || productResponse.data.id;
    
    if (newImages.length > 0 && productId) {
      const orderedImages = [...newImages].sort((a, b) => a.order - b.order);
      
      console.log(`Uploading ${orderedImages.length} images to product ${productId}`);
      
      for (const imageData of orderedImages) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageData.file);
        imageFormData.append('order', imageData.order.toString());
        imageFormData.append('alt_text', imageData.name || '');
        imageFormData.append('is_main', imageData.order === 1 ? 'true' : 'false');
        
        console.log(`Uploading image with order ${imageData.order}`);
        
        // Usar el endpoint correcto según tus URLs
        await api('post', `/products/${productId}/images/`, imageFormData, true);
      }
      
      console.log('All images uploaded successfully');
    }
    
    await loadProducts();
    resetForm();
  }; // <- Esta llave faltaba, causando el error

  // Eliminar producto
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

  // Resetear formulario
  const resetForm = useCallback(() => {
    newImages.forEach(img => {
      if (img.preview) URL.revokeObjectURL(img.preview);
    });
    
    setFormData({});
    setEditing(null);
    setShowForm(false);
    setNewImages([]);
  }, [newImages]);

  // Editar producto
  const editProduct = useCallback((product) => {
    const cleanProduct = { ...product };
    ['id_product', 'id', 'created_at', 'updated_at', 'images'].forEach(key => delete cleanProduct[key]);
    
    setFormData(cleanProduct);
    setEditing(product);
    setShowForm(true);
    setNewImages([]);
  }, []);

  // Configuración de campos
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

  // Formatear nombres de campos
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
      'processor_cores': 'Núcleos Procesador'
    };
    
    return translations[key] || key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Productos filtrados
  const filteredProducts = useMemo(() => {
    if (!debouncedSearch) return products;
    return products.filter(product => 
      product && Object.values(product).some(value =>
        value && value.toString().toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    );
  }, [products, debouncedSearch]);

  // Campos del formulario
  const formFields = useMemo(() => {
    if (!products || products.length === 0) return [];
    const sampleProduct = products[0];
    if (!sampleProduct) return [];
    
    const excludeFields = ['password', 'token', 'id_product', 'id', 'images', 'main_image', 'image_files', 'concat_key', 'created', 'updated'];
    return Object.keys(sampleProduct).filter(key => 
      !excludeFields.some(exclude => key.toLowerCase().includes(exclude.toLowerCase()))
    );
  }, [products]);

  // Efectos
  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
      loadFieldChoices();
    }
  }, [isAuthenticated, loadProducts, loadFieldChoices]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acceso Restringido</h2>
          <p className="text-gray-400">Debes iniciar sesión para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-full mx-auto">
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
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
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {showForm && (
          <form onSubmit={saveProduct} className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-6 text-blue-400">
              {editing ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formFields.map(field => {
                  const config = getFieldConfig(field);
                  
                  return (
                    <div key={field} className={config.type === 'textarea' ? 'md:col-span-2 lg:col-span-3' : ''}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {formatFieldName(field)} {config.required && <span className="text-red-400">*</span>}
                      </label>
                      
                      {config.type === 'select' ? (
                        <select
                          value={formData[field] || ''}
                          onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
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
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-vertical"
                          rows={3}
                          required={config.required}
                          placeholder={`Ingresa ${formatFieldName(field).toLowerCase()}`}
                        />
                      ) : (
                        <input
                          type={config.type}
                          value={formData[field] || ''}
                          onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          required={config.required}
                          placeholder={`Ingresa ${formatFieldName(field).toLowerCase()}`}
                          {...config.validation}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-700 pt-6">
                <ImageManager 
                  images={editing?.images || []}
                  productId={editing?.id_product}
                  onImageChange={loadProducts}
                  newImages={newImages}
                  onNewImagesChange={setNewImages}
                />
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button 
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Save size={18} /> {editing ? 'Actualizar' : 'Guardar'}
                </button>
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
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