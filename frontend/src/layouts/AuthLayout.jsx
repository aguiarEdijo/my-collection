import React from 'react';
import { Layout, Row, Col, Typography, Space } from 'antd';
import { CheckSquareOutlined } from '@ant-design/icons';

const { Content } = Layout;
const { Title, Text } = Typography;

const AuthLayout = ({ children }) => {
    return (
        <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Content>
                <Row style={{ minHeight: '100vh' }} align="middle" justify="center">
                    <Col xs={22} sm={16} md={12} lg={8} xl={6}>
                        {/* Logo/Brand */}
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <Space direction="vertical" size="small">
                                <CheckSquareOutlined style={{ fontSize: '48px', color: '#fff' }} />
                                <Title level={2} style={{ color: '#fff', margin: 0 }}>
                                    My Collection
                                </Title>
                                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    Gerencie suas tarefas de forma inteligente
                                </Text>
                            </Space>
                        </div>

                        {/* Auth Form Container */}
                        <div style={{
                            background: '#fff',
                            padding: '32px',
                            borderRadius: '16px',
                            boxShadow: '0 16px 32px rgba(0,0,0,0.2)',
                        }}>
                            {children}
                        </div>

                        {/* Footer */}
                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                                © 2024 My Collection. Todos os direitos reservados.
                            </Text>
                        </div>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default AuthLayout; 