import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCurrentCart,
  addToCart,
  updateCartLine,
  deleteCartLine,
} from '../api';

export const useCurrentCart = () => {
  const isAuth = !!localStorage.getItem('accessToken');
  return useQuery({
    queryKey: ['cart'],
    queryFn: getCurrentCart,
    enabled: isAuth,
    staleTime: 30 * 1000,
    retry: false,
  });
};

export const useCartItemCount = () => {
  const { data } = useCurrentCart();
  const lines = data?.salesorderline_set ?? data?.lines ?? [];
  return lines.reduce((n, l) => n + parseInt(l.product_qty ?? l.quantity ?? 1), 0);
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addToCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
};

export const useUpdateCartLine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCartLine,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
};

export const useDeleteCartLine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCartLine,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
};

export const useCart = () => {
  const queryClient = useQueryClient();
  const { data: cart, isLoading } = useCurrentCart();
  const cartItemCount = useCartItemCount();
  const addMutation = useAddToCart();
  const updateMutation = useUpdateCartLine();
  const deleteMutation = useDeleteCartLine();

  const updateCartCount = () => queryClient.invalidateQueries({ queryKey: ['cart'] });
  const clearCartCount = () => queryClient.setQueryData(['cart'], null);

  const updateCartQuantity = async (productId, newQuantity) => {
    const lines = cart?.salesorderline_set ?? cart?.lines ?? [];
    const line = lines.find(l => (l.product ?? l.product_id) === productId);
    const lineId = line?.id_salesorderline ?? line?.id;
    if (!lineId && newQuantity > 0) return addMutation.mutateAsync({ productId, quantity: newQuantity });
    if (!lineId) return false;
    if (newQuantity <= 0) return deleteMutation.mutateAsync(lineId);
    return updateMutation.mutateAsync({ lineId, data: { product_qty: newQuantity } });
  };

  const deleteLineById = lineId => deleteMutation.mutateAsync(lineId);
  const updateLineById = (lineId, data) => updateMutation.mutateAsync({ lineId, data });

  return {
    cartItemCount,
    currentCart: cart,
    loadCart: updateCartCount,
    updateCartCount,
    clearCartCount,
    addToCart: ({ productId, quantity }) => addMutation.mutateAsync({ productId, quantity }),
    cartData: cart,
    setCartData: d => queryClient.setQueryData(['cart'], d),
    loading: isLoading,
    updateCartQuantity,
    updateLineById,
    deleteLineById,
  };
};
