import React from 'react';
import { Layout } from 'antd';
import Navbar from './components/Navbar';
import AppRoutes from './routes';

const { Content } = Layout;

const App = () => {
  return (
    <Layout>
      <Navbar />
      <Content style={{ padding: '24px' }}>
        <AppRoutes />
      </Content>
    </Layout>
  );
};

export default App;