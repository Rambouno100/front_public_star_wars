import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../shared/theme/ThemeContext';
import { AuthProvider } from '../features/auth/context';
import { PaymentProvider } from '../features/payment/context';
import { getProducts } from '../features/catalog/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Precarga la primera página apenas monta la app, con la MISMA queryKey que
// usan la landing Y el catálogo (['products', '', 20, null, false]). Así un
// único fetch sirve al home y a /catalogo (ambos instantáneos).
const warmCatalog = () =>
  queryClient.prefetchInfiniteQuery({
    queryKey: ['products', '', 20, null, false],
    queryFn: ({ pageParam }) =>
      getProducts({ cursor: pageParam, q: '', limit: 20, purpose: null, flashOnly: false }),
    initialPageParam: undefined,
    getNextPageParam: last => last.next_cursor ?? undefined,
    staleTime: 5 * 60 * 1000,
  });

export const Providers = ({ children }) => {
  useEffect(() => { warmCatalog(); }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <PaymentProvider>
            {children}
          </PaymentProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
