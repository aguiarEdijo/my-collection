import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    Typography,
    Input,
    Select,
    Space,
    Row,
    Col,
    Alert,
    Badge,
    Tooltip,
    Button,
    Spin
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    SortAscendingOutlined,
    WifiOutlined,
    DisconnectOutlined,
    SyncOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import TodoGrid from '../components/TodoGrid';
import useTodos from '../hooks/useTodos';
import useDebounce from '../hooks/useDebounce';

const { Title } = Typography;
const { Option } = Select;

const TodosPage = () => {
    const {
        todos,
        loading,
        isOnline,
        hasPendingSync,
        loadTodos,
        toggleTodo,
        removeTodo,
        syncPendingChanges
    } = useTodos();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [refreshing, setRefreshing] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        if (todos.length === 0 && !loading) {
            loadTodos().catch(error => {
                console.error('Erro ao carregar todos:', error);
            });
        }
    }, []);

    const filteredAndSortedTodos = useMemo(() => {
        if (!Array.isArray(todos)) {
            return [];
        }

        try {
            // Primeiro, filtrar todos malformados e garantir IDs únicos
            const validTodos = todos.filter(todo => {
                // Verificações de segurança para evitar erros
                if (!todo || typeof todo !== 'object') {
                    return false;
                }

                // Garantir que tem ID válido
                if (!todo.id && todo.id !== 0) {
                    return false;
                }

                return true;
            });

            // Remover duplicatas baseadas no ID (manter o mais recente)
            const uniqueTodos = validTodos.reduce((acc, current) => {
                const existingIndex = acc.findIndex(todo => String(todo.id) === String(current.id));
                if (existingIndex > -1) {
                    // Se já existe, manter o que tem isOptimistic = false (mais recente da API)
                    if (!current.isOptimistic && acc[existingIndex].isOptimistic) {
                        acc[existingIndex] = current;
                    }
                } else {
                    acc.push(current);
                }
                return acc;
            }, []);

            let filtered = uniqueTodos.filter(todo => {
                const title = todo.title || '';
                const description = todo.description || '';
                const completed = Boolean(todo.completed);

                const matchesSearch = debouncedSearchTerm === '' ||
                    title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                    description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

                const matchesStatus = filterStatus === 'all' ||
                    (filterStatus === 'completed' && completed) ||
                    (filterStatus === 'pending' && !completed);

                return matchesSearch && matchesStatus;
            });

            return filtered.sort((a, b) => {
                try {
                    switch (sortBy) {
                        case 'newest':
                            // Usar timestamps para ordenação temporal
                            const aTime = typeof a.id === 'string' && a.id.startsWith('temp_')
                                ? parseInt(a.id.split('_')[1]) || Date.now()
                                : a.id;
                            const bTime = typeof b.id === 'string' && b.id.startsWith('temp_')
                                ? parseInt(b.id.split('_')[1]) || Date.now()
                                : b.id;
                            return bTime - aTime;
                        case 'oldest':
                            const aTimeOld = typeof a.id === 'string' && a.id.startsWith('temp_')
                                ? parseInt(a.id.split('_')[1]) || Date.now()
                                : a.id;
                            const bTimeOld = typeof b.id === 'string' && b.id.startsWith('temp_')
                                ? parseInt(b.id.split('_')[1]) || Date.now()
                                : b.id;
                            return aTimeOld - bTimeOld;
                        case 'alphabetical':
                            return (a.title || '').localeCompare(b.title || '');
                        case 'completed_first':
                            return Number(b.completed) - Number(a.completed);
                        case 'pending_first':
                            return Number(a.completed) - Number(b.completed);
                        default:
                            return 0;
                    }
                } catch (sortError) {
                    console.error('Erro na ordenação:', sortError);
                    return 0;
                }
            });
        } catch (error) {
            console.error('Erro na filtragem/ordenação de todos:', error);
            return [];
        }
    }, [todos, debouncedSearchTerm, filterStatus, sortBy]);

    const stats = useMemo(() => {
        if (!Array.isArray(filteredAndSortedTodos)) {
            return { total: 0, completed: 0, pending: 0, hasOptimistic: false };
        }

        const total = filteredAndSortedTodos.length;
        const completed = filteredAndSortedTodos.filter(todo =>
            todo && typeof todo === 'object' && Boolean(todo.completed)
        ).length;
        const pending = total - completed;
        const hasOptimistic = filteredAndSortedTodos.some(todo =>
            todo && typeof todo === 'object' && Boolean(todo.isOptimistic)
        );

        return { total, completed, pending, hasOptimistic };
    }, [filteredAndSortedTodos]);

    const handleToggle = useCallback(async (todoId) => {
        try {
            await toggleTodo(todoId);
        } catch (error) {
            const todoElement = document.querySelector(`[data-todo-id="${todoId}"]`);
            if (todoElement) {
                // shake(todoElement, 400); // Removed shake animation
            }
        }
    }, [toggleTodo]);

    const handleDelete = useCallback(async (todoId) => {
        try {
            await removeTodo(todoId);
        } catch (error) {
            const todoElement = document.querySelector(`[data-todo-id="${todoId}"]`);
            if (todoElement) {
                // shake(todoElement, 400); // Removed shake animation
            }
        }
    }, [removeTodo]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await loadTodos();
        } finally {
            setRefreshing(false);
        }
    }, [loadTodos]);

    const handleSync = useCallback(async () => {
        try {
            await syncPendingChanges();
        } catch (error) {
            console.error('Sync error:', error);
        }
    }, [syncPendingChanges]);

    return (
        <div style={{ padding: '24px' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                <Col>
                    <Space direction="vertical" size="small">
                        <Title level={2} style={{ margin: 0 }}>
                            Minhas Tarefas
                        </Title>
                        <Space>
                            <Badge
                                count={stats.total}
                                showZero
                                style={{ backgroundColor: '#1890ff' }}
                            />
                            <span>Total</span>
                            <Badge
                                count={stats.pending}
                                showZero
                                style={{ backgroundColor: '#faad14' }}
                            />
                            <span>Pendentes</span>
                            <Badge
                                count={stats.completed}
                                showZero
                                style={{ backgroundColor: '#52c41a' }}
                            />
                            <span>Concluídas</span>
                        </Space>
                    </Space>
                </Col>

                <Col>
                    <Space>
                        <Tooltip title={isOnline ? 'Online' : 'Offline'}>
                            <Badge
                                dot
                                color={isOnline ? '#52c41a' : '#ff4d4f'}
                            >
                                {isOnline ? <WifiOutlined /> : <DisconnectOutlined />}
                            </Badge>
                        </Tooltip>

                        {hasPendingSync && (
                            <Tooltip title="Sincronizar mudanças pendentes">
                                <Button
                                    type="primary"
                                    icon={<SyncOutlined />}
                                    onClick={handleSync}
                                    size="small"
                                >
                                    Sincronizar
                                </Button>
                            </Tooltip>
                        )}

                        <Tooltip title="Atualizar tarefas">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleRefresh}
                                loading={refreshing}
                                disabled={!isOnline}
                            />
                        </Tooltip>
                    </Space>
                </Col>
            </Row>

            {!isOnline && (
                <Alert
                    message="Modo Offline"
                    description="Você está trabalhando offline. As mudanças serão sincronizadas quando a conexão for restaurada."
                    type="warning"
                    showIcon
                    style={{ marginBottom: '16px' }}
                />
            )}

            {stats.hasOptimistic && (
                <Alert
                    message="Mudanças sendo processadas"
                    description="Algumas tarefas estão sendo sincronizadas com o servidor."
                    type="info"
                    showIcon
                    style={{ marginBottom: '16px' }}
                />
            )}

            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} md={8}>
                    <Input
                        placeholder="Buscar tarefas..."
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        allowClear
                    />
                </Col>

                <Col xs={12} sm={6} md={4}>
                    <Select
                        value={filterStatus}
                        onChange={setFilterStatus}
                        style={{ width: '100%' }}
                        suffixIcon={<FilterOutlined />}
                    >
                        <Option value="all">Todas</Option>
                        <Option value="pending">Pendentes</Option>
                        <Option value="completed">Concluídas</Option>
                    </Select>
                </Col>

                <Col xs={12} sm={6} md={4}>
                    <Select
                        value={sortBy}
                        onChange={setSortBy}
                        style={{ width: '100%' }}
                        suffixIcon={<SortAscendingOutlined />}
                    >
                        <Option value="newest">Mais recentes</Option>
                        <Option value="oldest">Mais antigas</Option>
                        <Option value="alphabetical">Alfabética</Option>
                        <Option value="pending_first">Pendentes primeiro</Option>
                        <Option value="completed_first">Concluídas primeiro</Option>
                    </Select>
                </Col>
            </Row>

            {loading && !refreshing ? (
                <div style={{ textAlign: 'center', padding: '64px 0' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px' }}>
                        <Typography.Text>Carregando suas tarefas...</Typography.Text>
                    </div>
                </div>
            ) : (
                <TodoGrid
                    todos={filteredAndSortedTodos}
                    loading={false}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    showStats={false}
                />
            )}

            {(debouncedSearchTerm || filterStatus !== 'all') && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <Typography.Text type="secondary">
                        {stats.total === 0
                            ? 'Nenhuma tarefa encontrada com os filtros aplicados'
                            : `Mostrando ${stats.total} tarefa${stats.total !== 1 ? 's' : ''} filtrada${stats.total !== 1 ? 's' : ''}`
                        }
                    </Typography.Text>
                </div>
            )}
        </div>
    );
};

export default TodosPage; 