import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodoStatus,
    addOptimisticTodo,
    removeOptimisticTodo,
    updateOptimisticTodo,
    clearError
} from '../features/todos/todosSlice';
import useApi from './useApi';
import useLocalStorage from './useLocalStorage';

const useTodos = () => {
    const dispatch = useDispatch();
    const { items: reduxTodos, status, error } = useSelector(state => state.todos);
    const { execute, loading: apiLoading } = useApi();

    const [cachedTodos, setCachedTodos] = useLocalStorage('todos_cache', []);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncPending, setSyncPending] = useState([]);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const todos = useMemo(() => {
        if (isOnline || reduxTodos.length > 0) {
            return reduxTodos;
        }
        return cachedTodos;
    }, [reduxTodos, cachedTodos, isOnline]);

    useEffect(() => {
        if (reduxTodos.length > 0) {
            setCachedTodos(reduxTodos);
        }
    }, [reduxTodos, setCachedTodos]);

    const loadTodos = useCallback(async () => {
        if (!isOnline && cachedTodos.length > 0) {
            return cachedTodos;
        }

        return await execute(
            () => dispatch(fetchTodos()).unwrap(),
            {
                showErrorMessage: false
            }
        );
    }, [execute, dispatch, isOnline]);

    const addTodo = useCallback(async (todoData) => {
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const optimisticTodo = {
            ...todoData,
            id: tempId,
            completed: false,
            isOptimistic: true
        };

        if (!isOnline) {
            setCachedTodos(prev => [...prev, optimisticTodo]);
            setSyncPending(prev => [...prev, { action: 'create', data: todoData, tempId }]);
            return optimisticTodo;
        }

        dispatch(addOptimisticTodo(optimisticTodo));

        try {
            const result = await execute(
                () => dispatch(createTodo(todoData)).unwrap(),
                {
                    showSuccessMessage: false,
                    showErrorMessage: false
                }
            );

            dispatch(removeOptimisticTodo(tempId));
            return result;
        } catch (error) {
            dispatch(removeOptimisticTodo(tempId));
            throw error;
        }
    }, [execute, dispatch, isOnline, setCachedTodos]);

    const editTodo = useCallback(async (todoId, updatedData) => {
        if (!isOnline) {
            setCachedTodos(prev =>
                prev.map(todo =>
                    todo.id === todoId ? { ...todo, ...updatedData, isOptimistic: true } : todo
                )
            );
            setSyncPending(prev => [...prev, { action: 'update', todoId, data: updatedData }]);
            return;
        }

        dispatch(updateOptimisticTodo({ id: todoId, updates: { ...updatedData, isOptimistic: true } }));

        try {
            const result = await execute(
                () => dispatch(updateTodo({ todoId, updatedData })).unwrap(),
                {
                    showSuccessMessage: false,
                    showErrorMessage: false
                }
            );

            return result;
        } catch (error) {
            dispatch(updateOptimisticTodo({ id: todoId, updates: { isOptimistic: false } }));
            throw error;
        }
    }, [execute, dispatch, isOnline, setCachedTodos]);

    const toggleTodo = useCallback(async (todoId) => {
        const todo = todos.find(t => t.id === todoId);
        if (!todo) return;

        const newStatus = !todo.completed;

        if (!isOnline) {
            setCachedTodos(prev =>
                prev.map(t => t.id === todoId ? { ...t, completed: newStatus, isOptimistic: true } : t)
            );
            setSyncPending(prev => [...prev, { action: 'toggle', todoId }]);
            return;
        }

        dispatch(updateOptimisticTodo({
            id: todoId,
            updates: { completed: newStatus, isOptimistic: true }
        }));

        try {
            const result = await execute(
                () => dispatch(toggleTodoStatus({ todoId })).unwrap(),
                {
                    showSuccessMessage: false,
                    showErrorMessage: false
                }
            );

            return result;
        } catch (error) {
            dispatch(updateOptimisticTodo({
                id: todoId,
                updates: { completed: !newStatus, isOptimistic: false }
            }));
            throw error;
        }
    }, [execute, dispatch, todos, isOnline, setCachedTodos]);

    const removeTodo = useCallback(async (todoId) => {
        const todoToRemove = todos.find(t => t.id === todoId);
        if (!todoToRemove) return;

        if (!isOnline) {
            setCachedTodos(prev => prev.filter(t => t.id !== todoId));
            setSyncPending(prev => [...prev, { action: 'delete', todoId }]);
            return;
        }

        // Optimistic update: remove imediatamente
        dispatch(removeOptimisticTodo(todoId));
        setCachedTodos(prev => prev.filter(t => t.id !== todoId));

        try {
            await execute(
                () => dispatch(deleteTodo(todoId)).unwrap(),
                {
                    showSuccessMessage: false,
                    showErrorMessage: false
                }
            );
        } catch (error) {
            // Reverter: adicionar de volta em caso de erro
            dispatch(addOptimisticTodo(todoToRemove));
            setCachedTodos(prev => [...prev, todoToRemove]);
            throw error;
        }
    }, [execute, dispatch, todos, isOnline, setCachedTodos]);

    const syncPendingChanges = useCallback(async () => {
        if (!isOnline || syncPending.length === 0) return;

        const operations = [...syncPending];
        setSyncPending([]);

        try {
            for (const operation of operations) {
                switch (operation.action) {
                    case 'create':
                        await dispatch(createTodo(operation.data)).unwrap();
                        break;
                    case 'update':
                        await dispatch(updateTodo({
                            todoId: operation.todoId,
                            updatedData: operation.data
                        })).unwrap();
                        break;
                    case 'toggle':
                        await dispatch(toggleTodoStatus({
                            todoId: operation.todoId
                        })).unwrap();
                        break;
                    case 'delete':
                        await dispatch(deleteTodo(operation.todoId)).unwrap();
                        break;
                }
            }
        } catch (error) {
            setSyncPending(prev => [...operations, ...prev]);
            console.error('Erro ao sincronizar mudanças:', error);
        }
    }, [dispatch, isOnline, syncPending]);

    // Agora podemos usar syncPendingChanges com segurança
    useEffect(() => {
        if (isOnline && syncPending.length > 0) {
            syncPendingChanges();
        }
    }, [isOnline, syncPendingChanges]);

    const clearErrors = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const isLoading = useMemo(() =>
        status === 'loading' || apiLoading
        , [status, apiLoading]);

    return {
        todos,
        loading: isLoading,
        error,
        isOnline,
        hasPendingSync: syncPending.length > 0,
        loadTodos,
        addTodo,
        editTodo,
        toggleTodo,
        removeTodo,
        syncPendingChanges,
        clearErrors
    };
};

export default useTodos; 