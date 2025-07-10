import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Form, Input, Button, Card, Typography, Space, Alert } from 'antd';
import { PlusOutlined, SaveOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useTodos from '../hooks/useTodos';
import useAnimations from '../hooks/useAnimations';
import { useNotification } from './NotificationProvider';

const { Title } = Typography;
const { TextArea } = Input;

const TodoForm = ({ initialValues, onSubmit, mode = 'create' }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();
  const formRef = useRef(null);

  const { addTodo, editTodo, isOnline } = useTodos();
  const { fadeIn, shake, bounce } = useAnimations();
  const { showCrudFeedback, showWarning } = useNotification();

  useEffect(() => {
    if (formRef.current) {
      fadeIn(formRef.current, 400);
    }
  }, [fadeIn]);

  const handleFormChange = () => {
    setHasChanges(true);
  };

  const validateTitle = (_, value) => {
    if (!value || value.trim().length === 0) {
      return Promise.reject('Título é obrigatório');
    }
    if (value.trim().length > 200) {
      return Promise.reject('Título deve ter no máximo 200 caracteres');
    }
    if (value.trim().length < 3) {
      return Promise.reject('Título deve ter pelo menos 3 caracteres');
    }
    return Promise.resolve();
  };

  const validateDescription = (_, value) => {
    if (value && value.length > 1000) {
      return Promise.reject('Descrição deve ter no máximo 1000 caracteres');
    }
    return Promise.resolve();
  };

  const handleSubmit = async (values) => {
    if (!isOnline) {
      showWarning(
        'Modo Offline',
        'Você está offline. A tarefa será criada e sincronizada quando a conexão for restaurada.'
      );
    }

    setLoading(true);

    try {
      const todoData = {
        title: values.title.trim(),
        description: values.description?.trim() || '',
        completed: false
      };

      if (mode === 'create') {
        await addTodo(todoData);
        showCrudFeedback('create', 'tarefa', true, 'Tarefa criada com sucesso!');

        if (formRef.current) {
          bounce(formRef.current, 300);
        }

        form.resetFields();
        setHasChanges(false);
        navigate('/todos');

      } else {
        await editTodo(initialValues.id, todoData);
        showCrudFeedback('update', 'tarefa', true);

        if (onSubmit) {
          onSubmit(todoData);
        }
      }

    } catch (error) {
      if (formRef.current) {
        shake(formRef.current, 400);
      }

      showCrudFeedback(
        mode === 'create' ? 'create' : 'update',
        'tarefa',
        false,
        `Erro ao ${mode === 'create' ? 'criar' : 'atualizar'} tarefa: ${error.message || 'Tente novamente'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = useCallback(() => {
    if (hasChanges) {
      showWarning(
        'Descartar alterações?',
        'Você tem alterações não salvas que serão perdidas.'
      );
    }
    navigate('/todos');
  }, [hasChanges, showWarning, navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        form.submit();
      }

      if (e.key === 'Escape' && !loading) {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [loading, form, handleCancel]);

  return (
    <div className="todo-form-container animate-fade-in" ref={formRef}>
      <Card
        title={
          <Space>
            {mode === 'create' ? <PlusOutlined /> : <SaveOutlined />}
            <Title level={3} style={{ margin: 0 }}>
              {mode === 'create' ? 'Nova Tarefa' : 'Editar Tarefa'}
            </Title>
          </Space>
        }
        className="todo-form-card hover-lift transition-all"
        style={{ maxWidth: '600px', margin: '0 auto' }}
      >
        {!isOnline && (
          <Alert
            message="Modo Offline"
            description="Você está offline. A tarefa será salva localmente e sincronizada quando a conexão for restaurada."
            type="warning"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleFormChange}
          initialValues={initialValues}
          autoComplete="off"
        >
          <Form.Item
            label="Título da Tarefa"
            name="title"
            rules={[{ validator: validateTitle }]}
            hasFeedback
          >
            <Input
              placeholder="Ex: Adicionar tarefa"
              size="large"
              maxLength={200}
              showCount
              disabled={loading}
              autoFocus
              className="transition-colors"
            />
          </Form.Item>

          <Form.Item
            label="Descrição (opcional)"
            name="description"
            rules={[{ validator: validateDescription }]}
            hasFeedback
          >
            <TextArea
              placeholder="Descreva os detalhes da sua tarefa..."
              rows={4}
              maxLength={1000}
              showCount
              disabled={loading}
              className="transition-colors"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: '32px' }}>
            <Space size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button
                onClick={handleCancel}
                disabled={loading}
                className="transition-colors"
              >
                Cancelar
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={loading ? <LoadingOutlined /> : (mode === 'create' ? <PlusOutlined /> : <SaveOutlined />)}
                size="large"
                className="transition-all"
                disabled={!isOnline && mode === 'edit'}
              >
                {loading
                  ? (mode === 'create' ? 'Criando...' : 'Salvando...')
                  : (mode === 'create' ? 'Criar Tarefa' : 'Salvar Alterações')
                }
              </Button>
            </Space>
          </Form.Item>

          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#fafafa',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#8c8c8c'
          }}>
            <Space split="•" size="small">
              <span>Ctrl+Enter para salvar rapidamente</span>
              <span>Esc para cancelar</span>
              <span>Máximo 200 caracteres no título</span>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default TodoForm;