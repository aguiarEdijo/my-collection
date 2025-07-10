import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Typography,
  Space,
  Divider,
  message
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined
} from '@ant-design/icons';
import { login } from '../features/auth/authSlice';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await dispatch(login(values)).unwrap();
      message.success('Login realizado com sucesso!');
      navigate('/');
    } catch (error) {
      message.error('Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Title level={2} style={{ margin: 0, color: '#262626' }}>
          Bem-vindo de volta!
        </Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Faça login para continuar gerenciando suas tarefas
        </Text>
      </div>

      {/* Formulário */}
      <Form
        layout="vertical"
        onFinish={handleSubmit}
        size="large"
        autoComplete="off"
      >
        <Form.Item
          name="username"
          label="Usuário"
          rules={[
            { required: true, message: 'Por favor, insira seu usuário' },
            { min: 3, message: 'O usuário deve ter pelo menos 3 caracteres' }
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#1890ff' }} />}
            placeholder="Digite seu usuário"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Senha"
          rules={[
            { required: true, message: 'Por favor, insira sua senha' },
            { min: 4, message: 'A senha deve ter pelo menos 4 caracteres' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#1890ff' }} />}
            placeholder="Digite sua senha"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: '16px' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<LoginOutlined />}
            block
            size="large"
            style={{
              height: '48px',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Form.Item>
      </Form>

      {/* Divider */}
      <Divider style={{ margin: '24px 0' }}>
        <Text type="secondary">ou</Text>
      </Divider>

      {/* Link para Registro */}
      <div style={{ textAlign: 'center' }}>
        <Space direction="vertical" size="small">
          <Text type="secondary">
            Não tem uma conta?
          </Text>
          <Link to="/register">
            <Button type="link" size="large" style={{ padding: 0, fontSize: '16px' }}>
              Criar conta gratuita
            </Button>
          </Link>
        </Space>
      </div>

      {/* Credenciais de teste */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: '#f6f8fa',
        borderRadius: '8px',
        border: '1px solid #e1e8ed'
      }}>
        <Text strong style={{ color: '#1890ff', fontSize: '14px' }}>
          💡 Credenciais de teste:
        </Text>
        <div style={{ marginTop: '8px' }}>
          <Text style={{ fontSize: '12px', color: '#666' }}>
            Usuário: <Text code>admin</Text> | Senha: <Text code>TestAdmin123!</Text>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Login;