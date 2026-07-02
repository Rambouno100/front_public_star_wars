import React from 'react';
import NavBar from './NavBar';

const Layout = ({ children }) => (
  <>
    <NavBar />
    <main>{children}</main>
  </>
);

export default Layout;
