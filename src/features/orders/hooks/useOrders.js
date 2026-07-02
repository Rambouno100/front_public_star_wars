import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, updateOrderLines } from '../api';

export const useOrders = ({ page = 1, state } = {}) =>
  useQuery({
    queryKey: ['orders', page, state],
    queryFn: () => getOrders({ page, state }),
    staleTime: 30 * 1000,
    placeholderData: prev => prev,
  });

export const useUpdateOrderLines = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOrderLines,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
};
