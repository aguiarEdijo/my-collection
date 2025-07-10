import React from 'react';
import { ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import AppRoutes from './routes';
import NotificationProvider from './components/NotificationProvider';
import './App.css';
import './styles/animations.css';

const App = () => {
  return (
    <ConfigProvider
      locale={ptBR}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#ff4d4f',
          colorInfo: '#1890ff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
          boxShadowSecondary: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
        components: {
          Card: {
            actionsBg: '#fafafa',
            hoverable: true,
          },
          Button: {
            primaryShadow: '0 2px 4px rgba(24, 144, 255, 0.2)',
          },
          Notification: {
            zIndexPopup: 1050,
          }
        }
      }}
    >
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </ConfigProvider>
  );
};

export default App;