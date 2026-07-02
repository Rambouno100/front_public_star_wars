import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

// Función para formatear nombres de campos
const formatFieldName = (key) => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

// Componente para mostrar la tabla de productos
const ProductsTable = ({ products, loading, onEdit, onDelete, search }) => {
  if (!products.length && !loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
        <p className="text-gray-400">No hay productos registrados</p>
      </div>
    );
  }

  // Obtener todas las columnas dinámicamente del primer producto
  const columns = products.length > 0 
    ? Object.keys(products[0]).filter(key => 
        !key.toLowerCase().includes('password') && 
        !key.toLowerCase().includes('token') &&
        key !== 'id' // Excluir campos sensibles y técnicos
      )
    : [];

  const filteredProducts = products.filter(product => 
    !search || Object.values(product).some(value => 
      value && String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-700">
              {columns.map(column => (
                <th key={column} className="px-4 py-4 text-left font-semibold text-blue-300 whitespace-nowrap">
                  {formatFieldName(column)}
                </th>
              ))}
              <th className="px-4 py-4 text-center font-semibold text-blue-300 whitespace-nowrap">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    Cargando productos...
                  </div>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-400">
                  {search ? 'No se encontraron productos' : 'No hay productos registrados'}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product, index) => (
                <tr 
                  key={product.id_product || product.id || index} 
                  className={`border-b border-gray-700/50 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-200 ${
                    index % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-900/50'
                  }`}
                >
                  {columns.map(column => (
                    <td key={column} className="px-4 py-4 text-gray-300 max-w-xs">
                      <div className="truncate" title={String(product[column] || '')}>
                        {column.toLowerCase().includes('price') && product[column] ? (
                          <span className="text-green-400 font-medium">
                            ${product[column]}
                          </span>
                        ) : column.toLowerCase().includes('stock') && product[column] !== undefined ? (
                          <span className={`font-medium ${product[column] > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {product[column]}
                          </span>
                        ) : column === 'name' || column === 'title' ? (
                          <div className="font-medium text-white">{product[column] || '-'}</div>
                        ) : (
                          String(product[column] || '-')
                        )}
                      </div>
                    </td>
                  ))}
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => onEdit(product)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(product.id_product || product.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 bg-gray-900/50 border-t border-gray-700 text-sm text-gray-400">
        Mostrando <span className="text-blue-400 font-medium">{filteredProducts.length}</span> de <span className="text-blue-400 font-medium">{products.length}</span> productos
      </div>
    </div>
  );
};

export default ProductsTable;