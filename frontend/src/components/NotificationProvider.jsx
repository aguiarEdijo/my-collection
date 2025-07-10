import React, { createContext, useContext, useState, useCallback } from 'react';
import { notification, message } from 'antd';
import {
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined,
    CloseCircleOutlined,
    LoadingOutlined,
    WifiOutlined,
    DisconnectOutlined,
    SyncOutlined
} from '@ant-design/icons';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification deve ser usado dentro de NotificationProvider');
    }
    return context;
};

const NotificationProvider = ({ children }) => {
    const [activeNotifications, setActiveNotifications] = useState([]);

    // Configurações padrão para diferentes tipos
    const getTypeConfig = (type) => {
        const configs = {
            success: {
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                className: 'notification-success',
                duration: 4.5
            },
            error: {
                icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                className: 'notification-error',
                duration: 6
            },
            warning: {
                icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
                className: 'notification-warning',
                duration: 4.5
            },
            info: {
                icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
                className: 'notification-info',
                duration: 4.5
            },
            loading: {
                icon: <LoadingOutlined style={{ color: '#1890ff' }} />,
                className: 'notification-loading',
                duration: 0 // Não fecha automaticamente
            },
            offline: {
                icon: <DisconnectOutlined style={{ color: '#ff4d4f' }} />,
                className: 'notification-offline',
                duration: 0
            },
            online: {
                icon: <WifiOutlined style={{ color: '#52c41a' }} />,
                className: 'notification-online',
                duration: 3
            },
            sync: {
                icon: <SyncOutlined style={{ color: '#722ed1' }} />,
                className: 'notification-sync',
                duration: 0
            }
        };

        return configs[type] || configs.info;
    };

    // Notificação toast simples
    const showToast = useCallback((type, content, options = {}) => {
        const config = getTypeConfig(type);

        message[type === 'error' ? 'error' : type === 'warning' ? 'warning' : type === 'loading' ? 'loading' : 'success'](
            content,
            options.duration || config.duration
        );
    }, []);

    // Notificação rica com título e descrição
    const showNotification = useCallback((type, title, description, options = {}) => {
        const config = getTypeConfig(type);
        const notificationId = Date.now().toString();

        const notificationConfig = {
            message: title,
            description,
            icon: config.icon,
            duration: options.duration || config.duration,
            placement: options.placement || 'topRight',
            className: config.className,
            key: notificationId,
            ...options
        };

        notification.open(notificationConfig);

        // Rastrear notificações ativas
        setActiveNotifications(prev => [...prev, { id: notificationId, type, title }]);

        // Remover da lista após fechar
        setTimeout(() => {
            setActiveNotifications(prev => prev.filter(n => n.id !== notificationId));
        }, (options.duration || config.duration) * 1000 + 500);

        return notificationId;
    }, []);

    // Notificações específicas para casos de uso comuns
    const showSuccess = useCallback((message, description, options) => {
        return showNotification('success', message, description, options);
    }, [showNotification]);

    const showError = useCallback((message, description, options) => {
        return showNotification('error', message, description, options);
    }, [showNotification]);

    const showWarning = useCallback((message, description, options) => {
        return showNotification('warning', message, description, options);
    }, [showNotification]);

    const showInfo = useCallback((message, description, options) => {
        return showNotification('info', message, description, options);
    }, [showNotification]);

    // Notificação de loading persistente
    const showLoading = useCallback((message = 'Carregando...', description) => {
        return showNotification('loading', message, description, { duration: 0 });
    }, [showNotification]);

    // Fechar notificação específica
    const closeNotification = useCallback((key) => {
        notification.close(key);
        setActiveNotifications(prev => prev.filter(n => n.id !== key));
    }, []);

    // Fechar todas as notificações
    const closeAll = useCallback(() => {
        notification.destroy();
        setActiveNotifications([]);
    }, []);

    // Notificações para estado de conexão
    const showConnectionStatus = useCallback((isOnline) => {
        if (isOnline) {
            showNotification(
                'online',
                'Conexão Restaurada',
                'Você está online novamente. Sincronizando dados...',
                { duration: 3 }
            );
        } else {
            showNotification(
                'offline',
                'Sem Conexão',
                'Você está offline. As alterações serão sincronizadas quando a conexão for restaurada.',
                { duration: 0 }
            );
        }
    }, [showNotification]);

    // Notificação de sincronização
    const showSyncStatus = useCallback((status, count = 0) => {
        switch (status) {
            case 'pending':
                return showNotification(
                    'sync',
                    'Sincronização Pendente',
                    `${count} alteração${count !== 1 ? 'ões' : ''} aguardando sincronização`,
                    { duration: 0 }
                );
            case 'syncing':
                return showLoading('Sincronizando...', 'Enviando alterações para o servidor');
            case 'success':
                showSuccess('Sincronização Concluída', 'Todas as alterações foram sincronizadas');
                break;
            case 'error':
                showError(
                    'Erro na Sincronização',
                    'Não foi possível sincronizar algumas alterações. Tente novamente.'
                );
                break;
        }
    }, [showNotification, showLoading, showSuccess, showError]);

    // Feedback para operações CRUD
    const showCrudFeedback = useCallback((operation, entity = 'item', success = true, customMessage) => {
        const operations = {
            create: success ? `${entity} criado com sucesso!` : `Erro ao criar ${entity}`,
            update: success ? `${entity} atualizado com sucesso!` : `Erro ao atualizar ${entity}`,
            delete: success ? `${entity} removido com sucesso!` : `Erro ao remover ${entity}`,
            toggle: success ? 'Status alterado com sucesso!' : 'Erro ao alterar status'
        };

        const message = customMessage || operations[operation] || (success ? 'Operação realizada!' : 'Erro na operação');

        if (success) {
            showToast('success', message);
        } else {
            showToast('error', message);
        }
    }, [showToast]);

    const value = {
        // Métodos básicos
        showToast,
        showNotification,

        // Métodos por tipo
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showLoading,

        // Controle
        closeNotification,
        closeAll,

        // Métodos específicos
        showConnectionStatus,
        showSyncStatus,
        showCrudFeedback,

        // Estado
        activeNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationProvider; 