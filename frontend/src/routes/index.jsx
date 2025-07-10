import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import Dashboard from '../pages/Dashboard';
import TodosPage from '../pages/TodosPage';
import AddTodoPage from '../pages/AddTodoPage';
import Login from '../pages/Login';
import Register from '../pages/Register';

const PrivateRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  return token ? (
    <AppLayout>
      {children}
    </AppLayout>
  ) : (
    <Navigate to="/login" />
  );
};

const PublicRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  return !token ? (
    <AuthLayout>
      {children}
    </AuthLayout>
  ) : (
    <Navigate to="/" />
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas Privadas */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/todos"
        element={
          <PrivateRoute>
            <TodosPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/add-todo"
        element={
          <PrivateRoute>
            <AddTodoPage />
          </PrivateRoute>
        }
      />

      {/* Rotas Públicas */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Rota de fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;