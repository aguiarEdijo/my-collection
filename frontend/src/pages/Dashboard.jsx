import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Row,
    Col,
    Typography,
    Card,
    Statistic,
    Button,
    Space,
    List,
    Tag,
    Divider
} from 'antd';
import {
    PlusOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    TrophyOutlined,
    RightOutlined
} from '@ant-design/icons';
import { fetchTodos } from '../features/todos/todosSlice';

const { Title, Text } = Typography;

const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items: todos, status } = useSelector((state) => state.todos);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchTodos());
    }, [dispatch]);

    const stats = {
        total: todos.length,
        completed: todos.filter(t => t.completed).length,
        pending: todos.filter(t => !t.completed).length,
        completionRate: todos.length > 0 ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0
    };

    const recentTodos = todos
        .slice(0, 5)
        .sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));

    const quickActions = [
        {
            title: 'Nova Tarefa',
            description: 'Criar uma nova tarefa',
            icon: <PlusOutlined />,
            color: '#1890ff',
            action: () => navigate('/add-todo')
        },
        {
            title: 'Ver Todas',
            description: 'Visualizar todas as tarefas',
            icon: <CheckCircleOutlined />,
            color: '#52c41a',
            action: () => navigate('/todos')
        }
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <Title level={2} style={{ margin: 0 }}>
                    Olá, {user?.username || 'Usuário'}! 👋
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                    Aqui está um resumo das suas atividades
                </Text>
            </div>

            {/* Estatísticas */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total de Tarefas"
                            value={stats.total}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Pendentes"
                            value={stats.pending}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Concluídas"
                            value={stats.completed}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Taxa de Conclusão"
                            value={stats.completionRate}
                            suffix="%"
                            prefix={<TrophyOutlined />}
                            valueStyle={{
                                color: stats.completionRate >= 70 ? '#52c41a' :
                                    stats.completionRate >= 40 ? '#faad14' : '#ff4d4f'
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                {/* Ações Rápidas */}
                <Col xs={24} lg={8}>
                    <Card
                        title="Ações Rápidas"
                        extra={<Button type="link" onClick={() => navigate('/todos')}>Ver todas</Button>}
                    >
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            {quickActions.map((action, index) => (
                                <Card
                                    key={index}
                                    size="small"
                                    hoverable
                                    onClick={action.action}
                                    style={{
                                        cursor: 'pointer',
                                        border: `1px solid ${action.color}`,
                                        borderLeft: `4px solid ${action.color}`
                                    }}
                                >
                                    <Card.Meta
                                        avatar={
                                            <div style={{
                                                background: action.color,
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff'
                                            }}>
                                                {action.icon}
                                            </div>
                                        }
                                        title={action.title}
                                        description={action.description}
                                    />
                                </Card>
                            ))}
                        </Space>
                    </Card>
                </Col>

                {/* Tarefas Recentes */}
                <Col xs={24} lg={16}>
                    <Card
                        title="Tarefas Recentes"
                        extra={
                            <Button
                                type="link"
                                icon={<RightOutlined />}
                                onClick={() => navigate('/todos')}
                            >
                                Ver todas
                            </Button>
                        }
                    >
                        {recentTodos.length > 0 ? (
                            <List
                                dataSource={recentTodos}
                                rowKey={(todo) => todo?.id ? String(todo.id) : `todo-${Math.random().toString(36).substring(2)}`}
                                renderItem={(todo) => (
                                    <List.Item
                                        actions={[
                                            <Tag color={todo.completed ? 'green' : 'orange'} key="status">
                                                {todo.completed ? 'Concluído' : 'Pendente'}
                                            </Tag>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={
                                                <Text
                                                    style={{
                                                        textDecoration: todo.completed ? 'line-through' : 'none',
                                                        color: todo.completed ? '#8c8c8c' : '#262626'
                                                    }}
                                                >
                                                    {todo.title}
                                                </Text>
                                            }
                                            description={todo.description}
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                <Text type="secondary">Nenhuma tarefa encontrada</Text>
                                <br />
                                <Button
                                    type="primary"
                                    style={{ marginTop: '8px' }}
                                    onClick={() => navigate('/add-todo')}
                                >
                                    Criar primeira tarefa
                                </Button>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard; 