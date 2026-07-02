import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Providers } from './providers';
import { AppRouter } from './router';
import Layout from '../shared/ui/Layout';
import '../global.css';

const App = () => (
  <BrowserRouter>
    <Providers>
      <Layout>
        <AppRouter />
      </Layout>
    </Providers>
  </BrowserRouter>
);

export default App;
