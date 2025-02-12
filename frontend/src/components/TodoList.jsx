import React, { useEffect } from 'react';
import { List, Typography, Tag } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTodos } from '../features/todos/todosSlice';

const { Title } = Typography;

const TodoList = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.todos);

  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);

  return (
    <div>
      <Title level={2}>Lista de Todos</Title>
      <List
        dataSource={items}
        renderItem={(todo) => (
          <List.Item>
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