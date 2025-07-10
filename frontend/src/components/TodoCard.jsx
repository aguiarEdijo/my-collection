import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Card, Button, Typography, Space, Popconfirm, Tag, Tooltip } from 'antd';
import {
    CheckOutlined,
    DeleteOutlined,
    EditOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import useAnimations from '../hooks/useAnimations';
import { useNotification } from './NotificationProvider';

const { Text, Paragraph } = Typography;

const TodoCard = memo(({
    todo,
    onToggle,
    onEdit,
    onDelete,
    className = ''
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const cardRef = useRef(null);
    const hasAnimated = useRef(false);

    const { fadeIn, bounce, shake } = useAnimations();
    const { showCrudFeedback } = useNotification();

    useEffect(() => {
        if (cardRef.current && !hasAnimated.current) {
            fadeIn(cardRef.current, 400);
            hasAnimated.current = true;
        }
    }, [fadeIn]);

    const getCardClasses = useCallback(() => {
        let classes = ['todo-card', 'transition-all'];

        if (todo.completed) classes.push('completed');
        if (todo.isOptimistic) classes.push('optimistic');
        if (isHovered) classes.push('hover-lift');
        if (className) classes.push(className);

        return classes.join(' ');
    }, [todo.completed, todo.isOptimistic, isHovered, className]);

    const handleToggle = useCallback(async () => {
        if (isToggling) return;

        setIsToggling(true);

        try {
            if (cardRef.current) {
                bounce(cardRef.current, 600);
            }

            await onToggle(todo.id);

            const newStatus = !todo.completed;
            showCrudFeedback(
                'toggle',
                'tarefa',
                true,
                newStatus ? 'Tarefa marcada como concluída!' : 'Tarefa marcada como pendente!'
            );

        } catch (error) {
            if (cardRef.current) {
                shake(cardRef.current, 400);
            }
            showCrudFeedback('toggle', 'tarefa', false);
        } finally {
            setIsToggling(false);
        }
    }, [onToggle, todo.id, todo.completed, bounce, shake, showCrudFeedback, isToggling]);

    const handleDelete = useCallback(async () => {
        if (isDeleting) return;

        setIsDeleting(true);

        try {
            await onDelete(todo.id);
            showCrudFeedback('delete', 'tarefa', true);

        } catch (error) {
            if (cardRef.current) {
                shake(cardRef.current, 400);
            }
            showCrudFeedback('delete', 'tarefa', false);
        } finally {
            setIsDeleting(false);
        }
    }, [onDelete, todo.id, shake, showCrudFeedback]);

    const handleEdit = useCallback(() => {
        if (onEdit) {
            onEdit(todo);
        }
    }, [onEdit, todo]);

    const renderStatusIndicator = useCallback(() => {
        if (todo.isOptimistic) {
            return (
                <Tag icon={<SyncOutlined spin />} color="processing" size="small">
                    Sincronizando
                </Tag>
            );
        }

        if (todo.completed) {
            return (
                <Tag icon={<CheckCircleOutlined />} color="success" size="small">
                    Concluída
                </Tag>
            );
        }

        return (
            <Tag icon={<ClockCircleOutlined />} color="warning" size="small">
                Pendente
            </Tag>
        );
    }, [todo.isOptimistic, todo.completed]);

    const renderActions = useCallback(() => {
        const actions = [];

        actions.push(
            <Tooltip
                key="toggle"
                title={todo.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
            >
                <Button
                    type={todo.completed ? 'default' : 'primary'}
                    icon={todo.completed ? <ClockCircleOutlined /> : <CheckOutlined />}
                    size="small"
                    loading={isToggling}
                    onClick={handleToggle}
                    disabled={isDeleting}
                    className="transition-colors"
                >
                    {todo.completed ? 'Reabrir' : 'Concluir'}
                </Button>
            </Tooltip>
        );

        if (onEdit) {
            actions.push(
                <Tooltip key="edit" title="Editar tarefa">
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={handleEdit}
                        disabled={isToggling || isDeleting}
                        className="transition-colors"
                    >
                        Editar
                    </Button>
                </Tooltip>
            );
        }

        actions.push(
            <Popconfirm
                key="delete"
                title="Excluir tarefa"
                description="Tem certeza que deseja excluir esta tarefa?"
                onConfirm={handleDelete}
                okText="Sim, excluir"
                cancelText="Cancelar"
                okButtonProps={{ danger: true }}
                disabled={isDeleting}
            >
                <Tooltip title="Excluir tarefa">
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        loading={isDeleting}
                        disabled={isToggling}
                        className="transition-colors"
                    >
                        Excluir
                    </Button>
                </Tooltip>
            </Popconfirm>
        );

        return actions;
    }, [todo.completed, isToggling, isDeleting, handleToggle, onEdit, handleEdit, handleDelete]);

    return (
        <Card
            ref={cardRef}
            className={getCardClasses()}
            data-todo-id={todo.id}
            data-new-todo={todo.isOptimistic ? 'true' : undefined}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                opacity: isDeleting ? 0.5 : 1,
                pointerEvents: isDeleting ? 'none' : 'auto'
            }}
            actions={renderActions()}
        >
            <div style={{ marginBottom: '16px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '8px'
                }}>
                    <div style={{ flex: 1 }}>
                        <Text
                            strong
                            style={{
                                fontSize: '16px',
                                textDecoration: todo.completed ? 'line-through' : 'none',
                                color: todo.completed ? '#8c8c8c' : '#262626',
                                opacity: todo.isOptimistic ? 0.8 : 1,
                                display: 'block',
                                lineHeight: 1.4
                            }}
                        >
                            {todo.title}
                        </Text>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {renderStatusIndicator()}
                        {todo.isOptimistic && (
                            <Tooltip title="Esta alteração está sendo sincronizada">
                                <SyncOutlined
                                    spin
                                    style={{ color: '#1890ff', fontSize: '12px' }}
                                />
                            </Tooltip>
                        )}
                    </div>
                </div>

                {todo.description && (
                    <Paragraph
                        ellipsis={{ rows: 2, expandable: true, symbol: 'ver mais' }}
                        style={{
                            margin: 0,
                            fontSize: '14px',
                            color: todo.completed ? '#8c8c8c' : '#595959',
                            opacity: todo.isOptimistic ? 0.8 : 1,
                            lineHeight: 1.5
                        }}
                    >
                        {todo.description}
                    </Paragraph>
                )}
            </div>

            {(isToggling || isDeleting) && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255, 255, 255, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        zIndex: 10
                    }}
                >
                    <Space direction="vertical" align="center">
                        <SyncOutlined spin style={{ fontSize: '24px', color: '#1890ff' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {isToggling ? 'Alterando status...' : 'Excluindo...'}
                        </Text>
                    </Space>
                </div>
            )}
        </Card>
    );
});

TodoCard.displayName = 'TodoCard';

export default TodoCard; 