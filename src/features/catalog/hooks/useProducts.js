import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getProducts, getProduct } from '../api';

export const useProducts = ({ q = '', limit, purpose = null, flashOnly = false } = {}) =>
  useInfiniteQuery({
    queryKey: ['products', q, limit, purpose, flashOnly],
    queryFn: ({ pageParam }) =>
      getProducts({ cursor: pageParam, q, limit, purpose, flashOnly }),
    getNextPageParam: last => last.next_cursor ?? undefined,
    staleTime: 5 * 60 * 1000,
    placeholderData: prev => prev,
  });

export const useProduct = id =>
  useQuery({
    queryKey: ['products', id],
    queryFn: () => getProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
