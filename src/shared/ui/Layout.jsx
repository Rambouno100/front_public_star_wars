import React from 'react';
import NavBar from './NavBar';
import WhatsAppFloat from './WhatsAppFloat';

const Layout = ({ children }) => (
  <>
    <NavBar />
    <main>{children}</main>
    <WhatsAppFloat />
  </>
);

export default Layout;
