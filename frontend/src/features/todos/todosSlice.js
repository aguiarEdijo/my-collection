import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchTodos = createAsyncThunk(
    'todos/fetchTodos',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/todos/');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || 'Erro ao carregar tarefas');
        }
    }
);

export const createTodo = createAsyncThunk(
    'todos/createTodo',
    async (todoData, { rejectWithValue }) => {
        try {
            const response = await api.post('/todos/', todoData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || 'Erro ao criar tarefa');
        }
    }
);

export const updateTodo = createAsyncThunk(
    'todos/updateTodo',
    async ({ todoId, updatedData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/todos/${todoId}`, updatedData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || 'Erro ao atualizar tarefa');
        }
    }
);

export const toggleTodoStatus = createAsyncThunk(
    'todos/toggleTodoStatus',
    async ({ todoId }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/todos/${todoId}/toggle`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || 'Erro ao alterar status');
        }
    }
);

export const deleteTodo = createAsyncThunk(
    'todos/deleteTodo',
    async (todoId, { rejectWithValue }) => {
        try {
            await api.delete(`/todos/${todoId}`);
            return todoId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || 'Erro ao excluir tarefa');
        }
    }
);

const todosSlice = createSlice({
    name: 'todos',
    initialState: {
        items: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearTodos: (state) => {
            state.items = [];
        },
        addOptimisticTodo: (state, action) => {
            state.items.push(action.payload);
        },
        removeOptimisticTodo: (state, action) => {
            state.items = state.items.filter(todo => todo.id !== action.payload);
        },
        updateOptimisticTodo: (state, action) => {
            const index = state.items.findIndex(todo => todo.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = { ...state.items[index], ...action.payload.updates };
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTodos.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchTodos.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
                state.error = null;
            })
            .addCase(fetchTodos.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(createTodo.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createTodo.fulfilled, (state, action) => {
                state.status = 'succeeded';

                // Remover todos os itens temporários primeiro
                state.items = state.items.filter(todo =>
                    !(typeof todo.id === 'string' && todo.id.includes('temp_'))
                );

                // Verificar se já existe item com mesmo ID real
                const existingIndex = state.items.findIndex(todo => todo.id === action.payload.id);

                if (existingIndex !== -1) {
                    state.items[existingIndex] = action.payload;
                } else {
                    state.items.push(action.payload);
                }
                state.error = null;
            })
            .addCase(createTodo.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(updateTodo.fulfilled, (state, action) => {
                const index = state.items.findIndex(todo => todo.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(updateTodo.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(toggleTodoStatus.fulfilled, (state, action) => {
                const index = state.items.findIndex(todo => todo.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(toggleTodoStatus.rejected, (state, action) => {
                state.error = action.payload;
            })

            .addCase(deleteTodo.fulfilled, (state, action) => {
                state.items = state.items.filter(todo => todo.id !== action.payload);
                state.error = null;
            })
            .addCase(deleteTodo.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const {
    clearError,
    clearTodos,
    addOptimisticTodo,
    removeOptimisticTodo,
    updateOptimisticTodo
} = todosSlice.actions;

export default todosSlice.reducer;
