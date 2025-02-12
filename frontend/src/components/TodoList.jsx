import React, { useEffect } from 'react';
import { List, Typography, Tag, Checkbox, Button, Popconfirm, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTodos, toggleTodoStatus, deleteTodo } from '../features/todos/todosSlice';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

const TodoList = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.todos);

  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);

  // Função para alternar o status do Todo
  const handleToggleStatus = async (todoId, completed) => {
    try {
      await dispatch(toggleTodoStatus({ todoId, completed: !completed })).unwrap();
      message.success('Status atualizado com sucesso!');
    } catch (error) {
      message.error('Erro ao atualizar status.');
    }
  };

  // Função para excluir um Todo
  const handleDeleteTodo = async (todoId) => {
    try {
      await dispatch(deleteTodo(todoId)).unwrap();
      message.success('Tarefa excluída com sucesso!');
    } catch (error) {
      message.error('Erro ao excluir tarefa.');
    }
  };

  return (
    <div>
      <Title level={2}>Lista de Tarefas</Title>
      <List
        dataSource={items}
        loading={status === 'loading'}
        renderItem={(todo) => (
          <List.Item
            actions={[
              // Checkbox para alternar o status
              <Checkbox
                key="toggle"
                checked={todo.completed}
                onChange={() => handleToggleStatus(todo.id, todo.completed)}
              />,
              // Botão de edição (pode ser substituído por um link para a página de edição)
              <Button
                key="edit"
                type="link"
                icon={<EditOutlined />}
                onClick={() => message.info('Funcionalidade de edição em desenvolvimento.')}
              />,
              // Botão de exclusão com confirmação
              <Popconfirm
                key="delete"
                title="Tem certeza que deseja excluir esta tarefa?"
                onConfirm={() => handleDeleteTodo(todo.id)}
                okText="Sim"
                cancelText="Não"
              >
                <Button type="link" danger icon={<DeleteOutlined />} />
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              title={todo.title}
              description={todo.description}
            />
            <Tag color={todo.completed ? 'green' : 'red'}>
              {todo.completed ? 'Concluído' : 'Pendente'}
            </Tag>
          </List.Item>
        )}
      />
    </div>
  );
};

export default TodoList;