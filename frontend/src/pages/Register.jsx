import React from 'react';
import { Card, Form, Input, Button, Typography } from 'antd';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { register } from '../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css'; // Arquivo de estilos personalizados

const { Title, Text } = Typography;

const validationSchema = Yup.object().shape({
  username: Yup.string().required('O usuário é obrigatório'),
  password: Yup.string().required('A senha é obrigatória'),
});

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      await dispatch(register(values)).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao registrar:', error);
    }
  };

  return (
    <div className="register-container">
      <Card className="register-card">
        <Title level={2} className="register-title">
          Registrar
        </Title>
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit }) => (
            <Form onFinish={handleSubmit} layout="vertical">
              <Form.Item label="Usuário">
                <Field name="username" as={Input} />
                <ErrorMessage name="username" component="div" className="error-message" />
              </Form.Item>
              <Form.Item label="Senha">
                <Field name="password" as={Input.Password} />
                <ErrorMessage name="password" component="div" className="error-message" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Registrar
                </Button>
              </Form.Item>
            </Form>
          )}
        </Formik>
        <div className="login-link-container">
          <Text>
            Já tem uma conta?{' '}
            <Link to="/login" className="login-link">
              Faça login
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Register;