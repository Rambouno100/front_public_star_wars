import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { AdminRoute } from '../features/auth/components/AdminRoute';
import AdminLayout from '../features/admin/components/AdminLayout';

import LandingPage from '../features/landing/pages/LandingPage';
import LoginPage from '../features/auth/pages/LoginPage';
import CatalogPage from '../features/catalog/pages/CatalogPage';
import CartPage from '../features/cart/pages/CartPage';
import OrdersPage from '../features/orders/pages/OrdersPage';
import CheckoutPage from '../features/checkout/pages/CheckoutPage';
import OrderConfirmationPage from '../features/checkout/pages/OrderConfirmationPage';
import WarrantyPage from '../features/warranty/pages/WarrantyPage';
import ReferralPage from '../features/referrals/pages/ReferralPage';

import ProductsAdminPage from '../features/admin/pages/ProductsAdminPage';
import ProductEditPage from '../features/admin/pages/ProductEditPage';
import OrdersAdminPage from '../features/admin/pages/OrdersAdminPage';
import OrderDetailPage from '../features/admin/pages/OrderDetailPage';
import QuotePrintPage from '../features/admin/pages/QuotePrintPage';
import AIAssistantPage from '../features/admin/pages/AIAssistantPage';

export const AppRouter = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/catalogo" element={<CatalogPage />} />
    <Route path="/product/:id" element={<CatalogPage />} />
    <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
    <Route path="/garantia" element={<WarrantyPage />} />
    <Route path="/referidos" element={<ReferralPage />} />

    {/* Protected user routes */}
    <Route path="/carrito"      element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
    <Route path="/mis-pedidos"  element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
    <Route path="/direccion"    element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

    {/* Admin routes */}
    <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
      <Route index                      element={<ProductsAdminPage />} />
      <Route path="productos"           element={<ProductsAdminPage />} />
      <Route path="productos/nuevo"     element={<ProductEditPage />} />
      <Route path="productos/:id"       element={<ProductEditPage />} />
      <Route path="ordenes"             element={<OrdersAdminPage />} />
      <Route path="ordenes/:id"         element={<OrderDetailPage />} />
      <Route path="cotizar"             element={<QuotePrintPage />} />
      <Route path="asistente"           element={<AIAssistantPage />} />
    </Route>
  </Routes>
);
