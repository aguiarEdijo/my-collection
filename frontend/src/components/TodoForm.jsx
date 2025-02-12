import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { createTodo } from '../features/todos/todosSlice';
import { PlusOutlined } from '@ant-design/icons';
import './TodoForm.css';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('O título é obrigatório'),
  description: Yup.string().required('A descrição é obrigatória'),
});

const TodoForm = () => {
  const dispatch = useDispatch();

  const handleSubmit = async (values, { resetForm }) => {
    try {
      await dispatch(createTodo(values)).unwrap();
      message.success('Tarefa criada com sucesso!'); 
      resetForm();
    } catch (error) {
      message.error('Erro ao criar tarefa. Tente novamente.');
    }
  };

  return (
    <div className="todo-form-container">
      <Card title="Criar Novo Todo" className="todo-form-card">
        <Formik
          initialValues={{ title: '', description: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit }) => (
            <Form onFinish={handleSubmit} layout="vertical">
              <Form.Item label="Título">
                <Field name="title" as={Input} placeholder="Digite o título da tarefa" />
                <ErrorMessage name="title" component="div" className="error-message" />
              </Form.Item>
              <Form.Item label="Descrição">
                <Field
                  name="description"
                  as={Input.TextArea}
                  placeholder="Descreva a tarefa"
                  rows={4}
                />
                <ErrorMessage name="description" component="div" className="error-message" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                  Criar Tarefa
                </Button>
              </Form.Item>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default TodoForm;