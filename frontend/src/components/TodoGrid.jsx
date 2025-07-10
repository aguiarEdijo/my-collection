import React, { useMemo, memo } from 'react';
import { Row, Col, Typography, Empty, Spin, Space, Divider, Statistic } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import TodoCard from './TodoCard';

const { Title, Text } = Typography;

const TodoGrid = memo(({
    todos = [],
    loading = false,
    onToggle,
    onEdit,
    onDelete,
    showStats = true
}) => {
    // Sempre chamar todos os hooks primeiro
    const stats = useMemo(() => {
        const total = todos.length;
        const completed = todos.filter(todo => todo.completed).length;
        const pending = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, completed, pending, completionRate };
    }, [todos]);

    const groupedTodos = useMemo(() => {
        return {
            pending: todos.filter(todo => !todo.completed),
            completed: todos.filter(todo => todo.completed)
        };
    }, [todos]);

    const renderTodoCards = useMemo(() => (group, isPending = true) => {
        return group.map((todo) => {
            // Garantir que o ID seja sempre uma string válida e única
            const safeId = todo?.id ? String(todo.id) : `fallback-${Math.random().toString(36).substring(2)}`;

            return (
                <Col
                    key={safeId}
                    xs={24}
                    sm={12}
                    md={8}
                    lg={6}
                    xl={6}
                >
                    <TodoCard
                        todo={todo}
                        onToggle={onToggle}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                </Col>
            );
        });
    }, [onToggle, onEdit, onDelete]);

    const renderStats = useMemo(() => {
        if (!showStats) return null;

        return (
            <>
                <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col xs={24} sm={6}>
                        <Statistic
                            title="Total de Tarefas"
                            value={stats.total}
                            prefix={<PlusCircleOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Col>
                    <Col xs={24} sm={6}>
                        <Statistic
                            title="Pendentes"
                            value={stats.pending}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Col>
                    <Col xs={24} sm={6}>
                        <Statistic
                            title="Concluídas"
                            value={stats.completed}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Col>
                    <Col xs={24} sm={6}>
                        <Statistic
                            title="Taxa de Conclusão"
                            value={stats.completionRate}
                            suffix="%"
                            valueStyle={{
                                color: stats.completionRate >= 70 ? '#52c41a' :
                                    stats.completionRate >= 40 ? '#faad14' : '#ff4d4f'
                            }}
                        />
                    </Col>
                </Row>
                <Divider />
            </>
        );
    }, [showStats, stats]);

    const renderPendingSection = useMemo(() => {
        if (groupedTodos.pending.length === 0) return null;

        return (
            <>
                <div style={{ marginBottom: '16px' }}>
                    <Title level={4} style={{ margin: 0, color: '#faad14' }}>
                        <ClockCircleOutlined style={{ marginRight: '8px' }} />
                        Tarefas Pendentes ({groupedTodos.pending.length})
                    </Title>
                </div>

                <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
                    {renderTodoCards(groupedTodos.pending, true)}
                </Row>
            </>
        );
    }, [groupedTodos.pending, renderTodoCards]);

    const renderCompletedSection = useMemo(() => {
        if (groupedTodos.completed.length === 0) return null;

        return (
            <>
                <div style={{ marginBottom: '16px' }}>
                    <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                        <CheckCircleOutlined style={{ marginRight: '8px' }} />
                        Tarefas Concluídas ({groupedTodos.completed.length})
                    </Title>
                </div>

                <Row gutter={[16, 16]}>
                    {renderTodoCards(groupedTodos.completed, false)}
                </Row>
            </>
        );
    }, [groupedTodos.completed, renderTodoCards]);

    // AGORA sim, podemos fazer returns condicionais
    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>
                    <Text>Carregando suas tarefas...</Text>
                </div>
            </div>
        );
    }

    if (todos.length === 0) {
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                    <Space direction="vertical" size="small">
                        <Text>Nenhuma tarefa encontrada</Text>
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                            Comece criando sua primeira tarefa!
                        </Text>
                    </Space>
                }
            />
        );
    }

    return (
        <div>
            {renderStats}
            {renderPendingSection}
            {renderCompletedSection}
        </div>
    );
});

TodoGrid.displayName = 'TodoGrid';

export default TodoGrid; 