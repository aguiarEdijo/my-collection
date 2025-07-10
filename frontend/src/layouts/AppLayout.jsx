import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import {
    MenuOutlined,
    HomeOutlined,
    PlusOutlined,
    CheckSquareOutlined,
    UserOutlined,
    LogoutOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AppLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleMenuToggle = () => {
        setCollapsed(!collapsed);
    };

    const menuItems = [
        {
            key: '/',
            icon: <HomeOutlined />,
            label: 'Dashboard',
            onClick: () => navigate('/')
        },
        {
            key: '/todos',
            icon: <CheckSquareOutlined />,
            label: 'Minhas Tarefas',
            onClick: () => navigate('/todos')
        },
        {
            key: '/add-todo',
            icon: <PlusOutlined />,
            label: 'Nova Tarefa',
            onClick: () => navigate('/add-todo')
        }
    ];

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Perfil',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Configurações',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Sair',
            onClick: handleLogout,
            danger: true,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                breakpoint="lg"
                collapsedWidth={0}
                onBreakpoint={(broken) => {
                    setCollapsed(broken);
                }}
                style={{
                    background: '#fff',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                }}
            >
                <div style={{
                    padding: '16px',
                    textAlign: 'center',
                    borderBottom: '1px solid #f0f0f0'
                }}>
                    <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                        My Collection
                    </Title>
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    style={{ border: 'none', marginTop: '16px' }}
                />
            </Sider>

            <Layout>
                {/* Header */}
                <Header style={{
                    padding: '0 24px',
                    background: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Button
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={handleMenuToggle}
                        style={{ fontSize: '16px' }}
                    />

                    <Dropdown
                        menu={{ items: userMenuItems }}
                        placement="bottomRight"
                        arrow
                    >
                        <Space style={{ cursor: 'pointer' }}>
                            <Avatar size="small" icon={<UserOutlined />} />
                            <span>{user?.username || 'Usuário'}</span>
                        </Space>
                    </Dropdown>
                </Header>

                {/* Content */}
                <Content style={{
                    padding: '24px',
                    background: '#f5f5f5',
                    minHeight: 'calc(100vh - 64px)'
                }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default AppLayout; 