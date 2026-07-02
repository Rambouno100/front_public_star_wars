import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const PULL_STATES = [
  { value: 'open', label: 'Abierto' },
  { value: 'close', label: 'Cerrado' },
];

export default function Administration() {
  const [pulls, setPulls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  useEffect(() => {
    setIsComponentMounted(true);
    return () => {
      setIsComponentMounted(false);
    };
  }, []);

  const fetchPulls = async (page = 1) => {
    if (!isComponentMounted) return;
    
    try {
      setError(null);
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL;
      
      if (!apiUrl) {
        throw new Error('API URL no está configurada');
      }

      const response = await axios.get(`${apiUrl}/pulls/?page=${page}`);
      
      if (isComponentMounted) {
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(response.data.count / 10),
          totalItems: response.data.count,
          itemsPerPage: 10
        });
        setPulls(response.data.results || []);
      }
    } catch (err) {
      if (isComponentMounted && err.response?.status !== 401) {
        console.error('Error fetching pulls:', err);
        setError(err.response?.data?.detail || err.message);
      }
    } finally {
      if (isComponentMounted) {
        setLoading(false);
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchPulls(newPage);
    }
  };

  const updatePullState = async (pullId, newState) => {
    if (!isComponentMounted) return;

    try {
      setError(null);
      const apiUrl = process.env.REACT_APP_API_URL;
      
      if (!apiUrl) {
        throw new Error('API URL no está configurada');
      }

      await axios.patch(
        `${apiUrl}/pulls/${pullId}/`, 
        { state: newState }
      );

      if (isComponentMounted) {
        setPulls(prevPulls => 
          prevPulls.map(pull => 
            pull.id_pull === pullId ? { ...pull, state: newState } : pull
          )
        );
        setSuccessMessage(`Estado actualizado correctamente a ${newState}`);
        setTimeout(() => {
          if (isComponentMounted) {
            setSuccessMessage('');
          }
        }, 3000);
      }
    } catch (err) {
      if (isComponentMounted && err.response?.status !== 401) {
        console.error('Error updating pull:', err);
        setError(err.response?.data?.detail || err.message);
        setTimeout(() => {
          if (isComponentMounted) {
            setError(null);
          }
        }, 3000);
      }
    }
  };

  useEffect(() => {
    if (isComponentMounted) {
      fetchPulls(pagination.currentPage);
    }
  }, [isComponentMounted]);

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  return (
    <div className="container mx-auto p-4" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--primary-color)' }}>Gestión de Pulls</h1>

      {error && (
        <div className="bg-red-50 border p-4 rounded-md mb-4" style={{ backgroundColor: '#2a1a1a', color: '#f87171', borderColor: '#742a2a' }}>
          <AlertCircle className="inline-block h-4 w-4 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border p-4 rounded-md mb-4" style={{ backgroundColor: '#1a2a1a', color: '#4ade80', borderColor: '#2a742a' }}>
          <CheckCircle className="inline-block h-4 w-4 mr-2" />
          <span>{successMessage}</span>
        </div>
      )}

      {pulls.length === 0 ? (
        <div className="text-center py-4">
          No hay registros disponibles
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border" style={{ backgroundColor: 'var(--card-bg-color)', borderColor: 'var(--border-color)', borderRadius: 'var(--border-radius)' }}>
              <thead style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-secondary)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Cantidad Actual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Descuento Actual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tiempo Restante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: 'var(--border-color)' }}>
                {pulls.map((pull) => (
                  <tr key={pull.id_pull}>
                    <td className="px-6 py-4 whitespace-nowrap">{pull.id_pull}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{pull.product?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{pull.current_quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{pull.current_discount}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">{pull.time_left}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={pull.state}
                        onChange={(e) => updatePullState(pull.id_pull, e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border focus:outline-none sm:text-sm rounded-md"
                        style={{ backgroundColor: 'var(--card-bg-color)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }}
                      >
                        {PULL_STATES.map(({ value, label }) => (
                          <option key={value} value={value} style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`p-2 rounded-md ${pagination.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                style={{ backgroundColor: 'var(--card-bg-color)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm">
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`p-2 rounded-md ${pagination.currentPage === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                style={{ backgroundColor: 'var(--card-bg-color)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="text-sm text-gray-500">
              Total: {pagination.totalItems} registros
            </div>
          </div>
        </>
      )}
    </div>
  );
}