import React, { useState, useEffect } from 'react';
import { Clock, Heart, Flag } from 'lucide-react';
import axios from 'axios';

const ProductCard = ({ product }) => {
  const [isInCart, setIsInCart] = useState(false);
  const [orden, setOrden] = useState(null);

  useEffect(() => {
    cargarOrden();
  }, []);

  const cargarOrden = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/sales-orders/?state=draft`);
      if (response.data.length > 0) {
        setOrden(response.data[0]);
        setIsInCart(response.data[0].salesorderline_set.some(line => line.id_product === product.id));
      } else {
        crearNuevaOrden();
      }
    } catch (error) {
      console.error('Error al cargar la orden:', error);
    }
  };

  const crearNuevaOrden = async () => {
    try {
      const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/user/`);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/sales-orders/`, {
        name: `Orden-${Date.now()}`,
        customer: userResponse.data.id,
        state: 'draft',
        order_type: 'regular',
        amount_total: 0,
        salesorderline_set: []
      });
      setOrden(response.data);
    } catch (error) {
      console.error('Error al crear nueva orden:', error);
    }
  };

  const toggleCart = async () => {
    if (!orden) return;

    try {
      if (isInCart) {
        // Remover del carrito
        const updatedLines = orden.salesorderline_set.filter(line => line.id_product !== product.id);
        await actualizarOrden(updatedLines);
        setIsInCart(false);
      } else {
        // Agregar al carrito
        const updatedLines = [
          ...orden.salesorderline_set,
          {
            id_product: product.id,
            product_qty: 1,
            price_subtotal: product.price
          }
        ];
        await actualizarOrden(updatedLines);
        setIsInCart(true);
      }
    } catch (error) {
      console.error('Error al actualizar el carrito:', error);
    }
  };

  const actualizarOrden = async (lines) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/sales-orders/${orden.id_salesorder}/`, {
        ...orden,
        salesorderline_set: lines
      });
      setOrden(response.data);
    } catch (error) {
      console.error('Error al actualizar la orden:', error);
    }
  };

  return (
    <div className="border p-4 rounded-lg shadow-md mb-4">
      <div className="aspect-w-9 aspect-h-9">
        <img src={product.img} alt={product.name} className="max-w-full max-h-full object-contain rounded" />
      </div>

      <h2 className="text-xl font-bold mb-2 text-left">{product.name}</h2>
      <p className="text-gray-600 mb-4 text-left bg-black text-white inline-block px-2 py-1 rounded">${product.price}</p>
      <hr className="my-4 border-gray-300" />
      {product.pull ? (
        <div className="flex items-center justify-start mb-4 text-gray-700">
          <Heart 
            className={`w-5 h-5 mr-2 cursor-pointer ${isInCart ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
            onClick={toggleCart}
          />
          <span>{product.pull.current}/{product.pull.goal} alcanzados</span>
          <span className="mx-2">|</span>
          <Clock className="w-5 h-5 mr-2" />
          <span>{product.pull.time_left}</span>
          <span className="mx-2">|</span>
          <Flag className="w-5 h-5 mr-2" />
          <span>10% de descuento</span>
        </div>
      ) : (
        <p>No pull information available</p>
      )}

      <div className="mt-4 text-gray-500 text-sm">
        <p>Si llegamos a la meta, ¡obtendrás un 10% de descuento!</p>
      </div>
    </div>
  );
};

export default ProductCard;