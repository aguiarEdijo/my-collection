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
  UserAddOutlined
} from '@ant-design/icons';
import { register } from '../features/auth/authSlice';

const { Title, Text } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await dispatch(register(values)).unwrap();
      message.success('Conta criada com sucesso! Faça login para continuar.');
      navigate('/login');
    } catch (error) {
      message.error('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Title level={2} style={{ margin: 0, color: '#262626' }}>
          Criar Conta
        </Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Junte-se a nós e comece a organizar suas tarefas
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
            { required: true, message: 'Por favor, insira um nome de usuário' },
            { min: 3, message: 'O usuário deve ter pelo menos 3 caracteres' },
            { max: 20, message: 'O usuário deve ter no máximo 20 caracteres' },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message: 'Use apenas letras, números e underscore'
            }
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#1890ff' }} />}
            placeholder="Digite seu nome de usuário"
            showCount
            maxLength={20}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Senha"
          rules={[
            { required: true, message: 'Por favor, insira uma senha' },
            { min: 4, message: 'A senha deve ter pelo menos 4 caracteres' },
            { max: 64, message: 'A senha deve ter no máximo 64 caracteres' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#1890ff' }} />}
            placeholder="Digite sua senha"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirmar Senha"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Por favor, confirme sua senha' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('As senhas não coincidem'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#1890ff' }} />}
            placeholder="Confirme sua senha"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: '16px' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<UserAddOutlined />}
            block
            size="large"
            style={{
              height: '48px',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </Form.Item>
      </Form>

      {/* Divider */}
      <Divider style={{ margin: '24px 0' }}>
        <Text type="secondary">ou</Text>
      </Divider>

      {/* Link para Login */}
      <div style={{ textAlign: 'center' }}>
        <Space direction="vertical" size="small">
          <Text type="secondary">
            Já tem uma conta?
          </Text>
          <Link to="/login">
            <Button type="link" size="large" style={{ padding: 0, fontSize: '16px' }}>
              Fazer login
            </Button>
          </Link>
        </Space>
      </div>
    </div>
  );
};

export default Register;