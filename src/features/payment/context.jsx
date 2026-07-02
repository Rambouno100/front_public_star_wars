import React, { createContext, useContext } from 'react';
import { createPayment, validatePayment } from './api';

export const PaymentContext = createContext(null);

export const usePaymentContext = () => {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error('usePaymentContext must be used within PaymentProvider');
  return ctx;
};

const PUBLIC_KEY = process.env.REACT_APP_PAYMENT_PUBLIC_KEY || '48322021:publickey_EGiFJsMIVbwnXqDrwzDcbYOJe2yXdcSRzb7FuYwI0Bolg';
const END_POINT = process.env.REACT_APP_PAYMENT_ENDPOINT || 'https://api.micuentaweb.pe';

export const PaymentProvider = ({ children }) => {
  // Acepta tanto getFormToken({ amount, orderLines }) como
  // getFormToken(amount, orderLines) — llamadas legacy de MisPedidos.
  const getFormToken = (a, b) => {
    const { amount, orderLines, orderId } = typeof a === 'object' && a !== null && !Array.isArray(a)
      ? a
      : { amount: a, orderLines: b };
    return createPayment({ amount, orderLines, orderId }).then(d => d.formToken);
  };

  return (
    <PaymentContext.Provider value={{ publicKey: PUBLIC_KEY, endPoint: END_POINT, getFormToken, validatePayment }}>
      {children}
    </PaymentContext.Provider>
  );
};
