import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Clock, Heart, Flag, CirclePlus, Minus, Plus } from 'lucide-react';
import axios from 'axios';
import './PullCard.css';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';

const PullCard = ({ pull, onOrderChange }) => {
  const navigate = useNavigate();
  const { isAuthenticated, checkAuthStatus } = useContext(AuthContext);
  const [isInCart, setIsInCart] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [currentLine, setCurrentLine] = useState(null);

  const checkOrderStatus = useCallback(async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/current-cart/`);
        if (response.data) {
            setCurrentOrder(response.data);

            // Búsqueda precisa de la línea de orden existente
            const line = response.data.salesorderline_set.find(
                line => line.product === pull.product.id_product && line.pull === pull.id_pull
            );

            if (line) {
                setIsInCart(true);
                setQuantity(parseInt(line.product_qty));
                setCurrentLine(line);
                setShowControls(true);
            } else {
                setIsInCart(false);
                setQuantity(0);
                setCurrentLine(null);
                setShowControls(false);
            }
        }
    } catch (error) {
        if (error.response?.status === 404) {
            await createNewOrder();
        } else {
            console.error('Error al verificar el estado de la orden:', error);
        }
    }
}, [pull.product.id_product, pull.id_pull]);

  const createNewOrder = async () => {
    try {
      const { data: { id: customerId } } = await axios.get(`${process.env.REACT_APP_API_URL}/user/`);
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/sales-orders/`, {
        customer: customerId,
        state: 'draft',
        order_type: 'regular',
        salesorderline_set: []
      });
      setCurrentOrder(data);
      return data;
    } catch (error) {
      console.error('Error al crear nueva orden:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      checkOrderStatus();
    }
  }, [isAuthenticated, checkOrderStatus]);

  const updateCart = useCallback(async (newQuantity) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!currentOrder) return;

    try {
        const lineData = {
            product: pull.product.id_product,
            product_qty: newQuantity,
            price_unit: parseFloat(pull.product.price).toFixed(2),
            pull: pull.id_pull,
            id_salesorder: currentOrder.id_salesorder
        };

        if (newQuantity <= 0 && currentLine) {
            await axios.delete(
                `${process.env.REACT_APP_API_URL}/update-salesorderline/${currentOrder.id_salesorder}/${pull.id_pull}/`
            );
            setCurrentLine(null);
            setQuantity(0);
            setIsInCart(false);
            setShowControls(false);
        } else if (currentLine) {
            await axios.put(
                `${process.env.REACT_APP_API_URL}/update-salesorderline/${currentOrder.id_salesorder}/${pull.id_pull}/`,
                lineData
            );
        } else if (newQuantity > 0) {
            const { data: newLine } = await axios.post(
                `${process.env.REACT_APP_API_URL}/sales-orders/${currentOrder.id_salesorder}/lines/`,
                lineData
            );
            setCurrentLine(newLine);
        }

        const { data: updatedOrder } = await axios.get(`${process.env.REACT_APP_API_URL}/current-cart/`);
        setCurrentOrder(updatedOrder);

        const updatedLine = updatedOrder.salesorderline_set.find(
            line => line.product === pull.product.id_product && line.pull === pull.id_pull
        );

        if (updatedLine) {
            setCurrentLine(updatedLine);
            setQuantity(parseInt(updatedLine.product_qty));
            setIsInCart(true);
            setShowControls(true);
        } else {
            setCurrentLine(null);
            setQuantity(0);
            setIsInCart(false);
            setShowControls(false);
        }

        if (onOrderChange) {
            onOrderChange();
        }
    } catch (error) {
        console.error('Error updating cart:', error);
        if (error.response?.status === 401) {
            checkAuthStatus();
        }
    }
}, [currentOrder, currentLine, pull.product.id_product, pull.id_pull, pull.product.price, onOrderChange, checkAuthStatus, isAuthenticated, navigate]);

  const toggleCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowControls(!showControls);
    if (!isInCart) {
      updateCart(1);
    }
  };

  const renderProgressBar = () => {
    const totalGoal = Math.max(...pull.goals.map(goal => parseInt(goal.target_quantity)));
    const progress = (parseInt(pull.current_quantity) / totalGoal) * 100;

    return (
      <div className="progress-container mt-4">
        <div className="progress-bar relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="progress-fill absolute top-0 left-0 h-full bg-blue-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="milestones relative h-16 mt-1">
          <div
            className="milestone absolute flex flex-col items-center"
            style={{ left: '0%' }}
          >
            <Heart size={16} className="text-gray-600" />
            <span className="text-xs font-semibold mt-1">0</span>
            <span className="text-xs">0%</span>
          </div>
          {pull.goals.map((goal, index) => (
            <div
              key={index}
              className="milestone absolute flex flex-col items-center"
              style={{ left: `calc(${(parseInt(goal.target_quantity) / totalGoal) * 100}% - 10px)` }}
            >
              <Heart size={16} className="text-gray-600" />
              <span className="text-xs font-semibold mt-1">{parseInt(goal.target_quantity)}</span>
              <span className="text-xs">{(goal.discount_percentage * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="pull-card">
        <div className="card-image">
          <div className="aspect-w-1">
            <img 
              src={pull.product.img} 
              alt={pull.product.name} 
              className="object-contain"
            />
          </div>
        </div>
        
        <div className="card-content">
          <div className="text-sm text-gray-600 mb-1">
            Compra grupal - {pull.state}
          </div>

          <h2 className="product-name">
            {pull.product.name}
          </h2>
          
          <div className="price-container">
            <div className="flex items-center gap-2">
              <div className="current-price">
                S/{(pull.product.price * (1 - pull.current_discount)).toFixed(2)}
              </div>
              <div className="original-price">
                S/{pull.product.price}
              </div>
              <div className="bg-red-600 text-white text-sm px-2 py-0.5 rounded-md">
                -{Math.round(pull.current_discount * 100)}%
              </div>
            </div>
          </div>
          
          <div className="cart-controls">
            <button 
              className={`add-to-cart ${isInCart ? 'in-cart' : ''}`}
              onClick={toggleCart}
            >
              <CirclePlus size={16} className="mr-2" />
              {isInCart ? '¡Añadido!' : '¡Unirme al grupo!'}
            </button>
            
            {showControls && (
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={() => updateCart(quantity - 1)}
                >
                  <Minus size={16} />
                </button>
                <span className="quantity">{quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => updateCart(quantity + 1)}
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
          
          <div className="progress-stats">
            <span title="Compradores actuales">
              <Heart size={16} />
              {parseInt(pull.current_quantity)} unidos de {Math.max(...pull.goals.map(goal => parseInt(goal.target_quantity)))}
            </span>
            <span title="Tiempo restante">
              <Clock size={16} /> {pull.time_left}
            </span>
            <span title="Descuento actual">
              <Flag size={16} /> {Math.round(pull.current_discount * 100)}% off
            </span>
          </div>
          
          {renderProgressBar()}
          
          <div className="text-xs text-gray-600 mt-2 text-center">
            ¡Mientras más personas se unan, mayor será el descuento para todos!
          </div>
        </div>
      </div>
    </div>
  );
};

export default PullCard;