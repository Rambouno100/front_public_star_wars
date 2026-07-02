import React, { useState, useEffect, useContext } from 'react';
import { ChevronDown, ChevronRight, Printer, Save } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../App';
import { THEME, ORDER_STATES, LINE_STATES } from './theme';
import { printQuotation } from './PrintQuotation';

export default function AdminSalesOrders() {
  const { isAuthenticated, checkAuthStatus } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [editingLines, setEditingLines] = useState({});
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setError(null);
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL;
      
      if (!apiUrl) {
        throw new Error('API URL no está configurada');
      }

      const response = await axios.get(`${apiUrl}/admin/sales/`);
      
      let ordersData = [];
      if (Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response.data?.orders) {
        ordersData = response.data.orders;
      } else if (response.data?.results) {
        ordersData = response.data.results;
      }
      
      setOrders(ordersData);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      
      if (error.response?.status === 401) {
        checkAuthStatus();
        setError('Sesión expirada. Redirigiendo al login...');
      } else if (error.response?.status === 403) {
        setError('No tienes permisos para acceder a esta información.');
      } else {
        setError(error.response?.data?.detail || error.message);
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
      setError('Debes iniciar sesión para acceder a esta página.');
    }
  }, [isAuthenticated]);

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const updateOrderState = async (orderId, newState) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      await axios.patch(`${apiUrl}/admin/sales/${orderId}/`, { state: newState });
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, state: newState } : order
      ));
    } catch (error) {
      console.error('Error updating order state:', error);
      if (error.response?.status === 401) {
        checkAuthStatus();
        setError('Sesión expirada.');
      } else {
        setError(error.response?.data?.detail || error.message);
      }
    }
  };

  const updateLineField = (lineId, field, value) => {
    setEditingLines(prev => ({
      ...prev,
      [lineId]: { ...prev[lineId], [field]: value }
    }));
  };

  const saveChanges = async (orderId) => {
    try {
      setError(null);
      const apiUrl = process.env.REACT_APP_API_URL;
      const order = orders.find(o => o.id === orderId);
      
      const lines_data = order.lines
        .map(line => {
          const editing = editingLines[line.id];
          if (!editing || Object.keys(editing).length === 0) return null;
          
          const mappedData = { id: line.id };
          
          if (editing.qty !== undefined) {
            mappedData.product_qty = editing.qty;
          }
          
          if (editing.price !== undefined) {
            mappedData.price_unit = editing.price;
          }
          
          if (editing.state !== undefined) {
            mappedData.state = editing.state;
          }
          
          if (editing.product !== undefined) {
            mappedData.product_name = editing.product;
          }
          
          return mappedData;
        })
        .filter(line => line !== null);

      console.log('Enviando datos:', { order_id: orderId, lines_data });

      await axios.patch(`${apiUrl}/admin/sales/`, {
        order_id: orderId,
        order_data: {},
        lines_data
      });

      setEditingLines({});
      fetchOrders();
      
    } catch (error) {
      console.error('Error saving changes:', error);
      if (error.response?.status === 401) {
        checkAuthStatus();
        setError('Sesión expirada.');
      } else {
        setError(error.response?.data?.detail || error.message);
      }
    }
  };

  const getCustomerName = (customer) => {
    if (typeof customer === 'string') return customer;
    if (typeof customer === 'object' && customer) {
      return customer.name || customer.username || customer.email || 'Cliente';
    }
    return 'Cliente';
  };

  const calculateSubtotal = (line) => {
    const editing = editingLines[line.id] || {};
    const qty = editing.qty !== undefined ? editing.qty : (line.qty || 0);
    const price = editing.price !== undefined ? editing.price : (line.price || 0);
    return qty * price;
  };

  const calculateOrderTotal = (orderLines) => {
    if (!Array.isArray(orderLines)) return 0;
    return orderLines.reduce((sum, line) => sum + calculateSubtotal(line), 0);
  };

  const hasChanges = () => {
    return Object.keys(editingLines).length > 0 && 
           Object.values(editingLines).some(line => Object.keys(line).length > 0);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center p-8 min-h-screen" style={{ backgroundColor: THEME.background }}>
        <div className="text-center p-8 rounded-xl" style={{ backgroundColor: THEME.cardBg, border: `1px solid ${THEME.border}` }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: THEME.textPrimary }}>
            Acceso Restringido
          </h2>
          <p style={{ color: THEME.textSecondary }}>
            Debes iniciar sesión para acceder a la administración de pedidos.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 min-h-screen" style={{ backgroundColor: THEME.background }}>
        <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full" style={{ borderColor: THEME.primary }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: THEME.background }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: THEME.textPrimary }}>
          Administración de Pedidos
        </h1>

        {error && (
          <div className="bg-red-50 border p-4 rounded-md mb-4" 
               style={{ backgroundColor: '#2a1a1a', color: '#f87171', borderColor: '#742a2a' }}>
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Cerrar
            </button>
          </div>
        )}
        
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-12 rounded-xl" 
                 style={{ backgroundColor: THEME.cardBg, border: `1px solid ${THEME.border}` }}>
              <p className="text-lg" style={{ color: THEME.textSecondary }}>
                No hay pedidos disponibles
              </p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
                   style={{ backgroundColor: THEME.cardBg, border: `1px solid ${THEME.border}` }}>
                
                <div className="p-6 flex items-center justify-between"
                     style={{ backgroundColor: THEME.cardBg, borderBottom: `1px solid ${THEME.border}` }}>
                  <div className="flex items-center space-x-4">
                    <button onClick={() => toggleOrder(order.id)} className="p-2 rounded-lg transition-colors">
                      {expandedOrders.has(order.id) ? 
                        <ChevronDown className="w-5 h-5" style={{ color: THEME.primary }} /> : 
                        <ChevronRight className="w-5 h-5" style={{ color: THEME.primary }} />
                      }
                    </button>
                    
                    <div>
                      <span className="font-bold text-lg" style={{ color: THEME.textPrimary }}>
                        Pedido #{order.id}
                      </span>
                      <span className="mx-3 text-xl" style={{ color: THEME.border }}>•</span>
                      <span className="font-medium" style={{ color: THEME.textSecondary }}>
                        {getCustomerName(order.customer)}
                      </span>
                      <span className="mx-3 text-xl" style={{ color: THEME.border }}>•</span>
                      <span className="text-sm" style={{ color: THEME.textSecondary }}>
                        {order.date_order}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <select value={order.state} onChange={(e) => updateOrderState(order.id, e.target.value)}
                            className="px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2"
                            style={{ backgroundColor: THEME.cardBg, color: THEME.textPrimary, border: `1px solid ${THEME.border}` }}>
                      {ORDER_STATES.map(state => (
                        <option key={state.value} value={state.value}>{state.label}</option>
                      ))}
                    </select>
                    
                    <button onClick={() => printQuotation(order)}
                            className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
                            style={{ backgroundColor: THEME.primary, color: 'white' }}>
                      <Printer className="w-4 h-4 mr-2" />
                      Cotización
                    </button>
                  </div>
                </div>

                {expandedOrders.has(order.id) && (
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                            <th className="text-left py-4 px-2 font-bold" style={{ color: THEME.textPrimary }}>Producto</th>
                            <th className="text-left py-4 px-2 w-24 font-bold" style={{ color: THEME.textPrimary }}>Cantidad</th>
                            <th className="text-left py-4 px-2 w-32 font-bold" style={{ color: THEME.textPrimary }}>Precio</th>
                            <th className="text-left py-4 px-2 w-32 font-bold" style={{ color: THEME.textPrimary }}>Subtotal</th>
                            <th className="text-left py-4 px-2 w-32 font-bold" style={{ color: THEME.textPrimary }}>Estado</th>
                            <th className="w-16 py-4 px-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.lines?.map(line => {
                            const editing = editingLines[line.id] || {};
                            const currentQty = editing.qty !== undefined ? editing.qty : line.qty;
                            const currentPrice = editing.price !== undefined ? editing.price : line.price;
                            const currentState = editing.state !== undefined ? editing.state : line.state;
                            
                            return (
                              <tr key={line.id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                                <td className="py-4 px-2">
                                  <input type="text"
                                         value={editing.product !== undefined ? editing.product : (line.product || '')}
                                         onChange={(e) => updateLineField(line.id, 'product', e.target.value)}
                                         className="w-full px-3 py-2 rounded-lg text-sm"
                                         style={{ backgroundColor: THEME.cardBg, color: THEME.textPrimary, border: `1px solid ${THEME.border}` }} />
                                </td>
                                <td className="py-4 px-2">
                                  <input type="number" value={currentQty || 0}
                                         onChange={(e) => updateLineField(line.id, 'qty', Number(e.target.value))}
                                         className="w-full px-3 py-2 rounded-lg text-sm"
                                         style={{ backgroundColor: THEME.cardBg, color: THEME.textPrimary, border: `1px solid ${THEME.border}` }} />
                                </td>
                                <td className="py-4 px-2">
                                  <input type="number" step="0.01" value={currentPrice || 0}
                                         onChange={(e) => updateLineField(line.id, 'price', Number(e.target.value))}
                                         className="w-full px-3 py-2 rounded-lg text-sm"
                                         style={{ backgroundColor: THEME.cardBg, color: THEME.textPrimary, border: `1px solid ${THEME.border}` }} />
                                </td>
                                <td className="py-4 px-2 font-bold text-lg" style={{ color: THEME.primary }}>
                                  S/ {calculateSubtotal(line).toFixed(2)}
                                </td>
                                <td className="py-4 px-2">
                                  <select value={currentState || 'draft'}
                                          onChange={(e) => updateLineField(line.id, 'state', e.target.value)}
                                          className="w-full px-3 py-2 rounded-lg text-sm"
                                          style={{ backgroundColor: THEME.cardBg, color: THEME.textPrimary, border: `1px solid ${THEME.border}` }}>
                                    {LINE_STATES.map(state => (
                                      <option key={state.value} value={state.value}>{state.label}</option>
                                    ))}
                                  </select>
                                </td>
                                <td className="py-4 px-2">
                                  {hasChanges() && (
                                    <button onClick={() => saveChanges(order.id)}
                                            className="p-2 rounded-lg transition-all duration-200 hover:opacity-80"
                                            style={{ backgroundColor: '#10b981', color: 'white' }}>
                                      <Save className="w-4 h-4" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-6 text-right p-4 rounded-lg"
                         style={{ backgroundColor: THEME.cardBg, border: `2px solid ${THEME.primary}` }}>
                      <span className="text-2xl font-bold" style={{ color: THEME.primary }}>
                        Total: S/ {calculateOrderTotal(order.lines).toFixed(2)}
                      </span>
                    </div>
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