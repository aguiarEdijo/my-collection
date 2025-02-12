import React from 'react';
import TodoList from '../components/TodoList';
import TodoForm from '../components/TodoForm';

const Home = () => {
  return (
    <div>
      <h1>Adicione Tarefas</h1>
      <TodoForm />
      <TodoList />
    </div>
  );
};

export default Home;