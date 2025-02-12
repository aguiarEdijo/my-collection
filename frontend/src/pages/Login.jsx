import React from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../features/auth/authSlice'; 
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; 

const { Title, Text } = Typography;

const validationSchema = Yup.object().shape({
  username: Yup.string().required('O usuário é obrigatório'),
  password: Yup.string().required('A senha é obrigatória'),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const error = useSelector((state) => state.auth.error); 

  const handleSubmit = async (values) => {
    try {
      await dispatch(login(values)).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Title level={2} className="login-title">
          Login
        </Title>
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit }) => (
            <Form onFinish={handleSubmit} layout="vertical">
              <Form.Item label="Usuário">
                <Field name="username" as={Input} maxLength={20} />
                <ErrorMessage name="username" component="div" className="error-message" />
              </Form.Item>
              <Form.Item label="Senha">
                <Field name="password" as={Input.Password} maxLength={64} />
                <ErrorMessage name="password" component="div" className="error-message" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Entrar
                </Button>
              </Form.Item>
            </Form>
          )}
        </Formik>
        <div className="register-link-container">
          {error && (
            <div className="error-message" style={{ color: 'red', marginBottom: '16px' }}>
              {error}
            </div>
          )}
        </div>
        <div className="register-link-container">
          <Text>
            Não tem uma conta?{' '}
            <Link to="/register" className="register-link">
              Registre-se
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;