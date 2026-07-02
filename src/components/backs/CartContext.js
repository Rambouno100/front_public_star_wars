// Compatibility shim — points to TanStack Query based hooks
export { useCart } from '../features/cart/hooks/useCart';
export const CartProvider = ({ children }) => children;
