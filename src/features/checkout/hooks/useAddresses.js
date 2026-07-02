import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAddresses, createAddress, getUbigeos } from '../api';

export const useAddresses = () =>
  useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
    staleTime: 60 * 1000,
  });

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAddress,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
};

export const useUbigeos = () =>
  useQuery({
    queryKey: ['ubigeos'],
    queryFn: getUbigeos,
    staleTime: Infinity,
  });
