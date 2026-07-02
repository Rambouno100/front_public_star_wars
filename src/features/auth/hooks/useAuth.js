import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { AuthContext } from '../context';
import { getMe, loginWithGoogle } from '../api';

export const useMe = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: !!localStorage.getItem('accessToken'),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

export const useIsAuthenticated = () => {
  const { data } = useMe();
  return !!data;
};

export const useIsLoading = () => useMe().isLoading;

export const useGoogleLogin = () => {
  const { login } = useContext(AuthContext);
  return useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: data => login(data.access),
  });
};

export const useLogout = () => {
  const { logout } = useContext(AuthContext);
  return logout;
};

export const useIsAdmin = () => {
  const { data } = useMe();
  return data?.is_staff === true;
};

export const useCheckAuthStatus = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['me'] });
};
