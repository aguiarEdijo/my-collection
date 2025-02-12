import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Função para adicionar o token de autenticação nos headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken'); // Supondo que você armazene o token no localStorage
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

// Listar todos
export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
    const response = await api.get('/todos/', {
        headers: getAuthHeaders()
    });
    return response.data;
});

export const createTodo = createAsyncThunk('todos/createTodo', async (todoData) => {
    const response = await api.post('/todos/', todoData, {
        headers: getAuthHeaders()
    });
    return response.data;
});

export const fetchTodoById = createAsyncThunk('todos/fetchTodoById', async (todoId) => {
    const response = await api.get(`/todos/${todoId}`, {
        headers: getAuthHeaders()
    });
    return response.data;
});

export const updateTodo = createAsyncThunk('todos/updateTodo', async ({ todoId, updatedData }) => {
    const response = await api.put(`/todos/${todoId}`, updatedData, {
        headers: getAuthHeaders()
    });
    return response.data;
});

export const toggleTodoStatus = createAsyncThunk('todos/toggleTodoStatus', async ({ todoId, completed }) => {
    const response = await api.patch(`/todos/${todoId}/toggle`, { completed }, {
        headers: getAuthHeaders()
    });
    return response.data;
});

export const deleteTodo = createAsyncThunk('todos/deleteTodo', async (todoId) => {
    await api.delete(`/todos/${todoId}`, {
        headers: getAuthHeaders()
    });
    return todoId;
});

const todosSlice = createSlice({
    name: 'todos',
    initialState: {
        items: [],
        selectedTodo: null,
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTodos.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTodos.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchTodos.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(createTodo.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createTodo.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items.push(action.payload);
            })
            .addCase(createTodo.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(fetchTodoById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTodoById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selectedTodo = action.payload;
            })
            .addCase(fetchTodoById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(updateTodo.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateTodo.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updatedTodo = action.payload;
                state.items = state.items.map((todo) =>
                    todo.id === updatedTodo.id ? updatedTodo : todo
                );
            })
            .addCase(updateTodo.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(deleteTodo.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteTodo.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const todoId = action.payload;
                state.items = state.items.filter((todo) => todo.id !== todoId);
            })
            .addCase(toggleTodoStatus.fulfilled, (state, action) => {
                const updatedTodo = action.payload;
                state.items = state.items.map((todo) =>
                    todo.id === updatedTodo.id ? updatedTodo : todo
                );
            })
            .addCase(deleteTodo.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });

    },
});

export default todosSlice.reducer;
