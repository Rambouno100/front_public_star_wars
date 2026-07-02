import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../shared/theme/ThemeContext';
import { AuthProvider } from '../features/auth/context';
import { PaymentProvider } from '../features/payment/context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const Providers = ({ children }) => (
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
