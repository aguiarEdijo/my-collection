import React from 'react';
import { Spin, Skeleton, Empty, Button, Typography, Space } from 'antd';
import {
    LoadingOutlined,
    ReloadOutlined,
    DisconnectOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;

// Loading spinner customizado
const CustomSpin = ({ size = 'default', tip, children, ...props }) => {
    const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 32 : 24 }} spin />;

    return (
        <Spin
            indicator={antIcon}
            tip={tip}
            size={size}
            {...props}
        >
            {children}
        </Spin>
    );
};

// Loading para lista de todos
export const TodoListLoading = ({ count = 6 }) => {
    return (
        <div style={{ padding: '16px' }}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} style={{ marginBottom: '16px' }}>
                    <Skeleton
                        active
                        title={{ width: '60%' }}
                        paragraph={{ rows: 2, width: ['100%', '80%'] }}
                        avatar={{ size: 'large', shape: 'square' }}
                        loading={true}
                    />
                </div>
            ))}
        </div>
    );
};

// Loading para grid de cards
export const TodoGridLoading = ({ count = 8 }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
            padding: '16px'
        }}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} style={{
                    background: '#fff',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #f0f0f0'
                }}>
                    <Skeleton
                        active
                        title={{ width: '80%' }}
                        paragraph={{ rows: 3, width: ['100%', '90%', '70%'] }}
                        loading={true}
                    />
                </div>
            ))}
        </div>
    );
};

// Loading de página completa
export const PageLoading = ({ message = 'Carregando...', size = 'large' }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            padding: '64px 24px'
        }}>
            <CustomSpin size={size} />
            <div style={{ marginTop: '16px' }}>
                <Text type="secondary">{message}</Text>
            </div>
        </div>
    );
};

// Loading inline para operações específicas
export const InlineLoading = ({ text = 'Carregando...', size = 'small' }) => {
    return (
        <Space>
            <CustomSpin size={size} />
            <Text type="secondary" style={{ fontSize: '14px' }}>{text}</Text>
        </Space>
    );
};

// Estados de erro com retry
export const ErrorState = ({
    title = 'Algo deu errado',
    description = 'Não foi possível carregar os dados',
    onRetry,
    showRetry = true,
    icon = <ExclamationCircleOutlined />
}) => {
    return (
        <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <div style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }}>
                {icon}
            </div>
            <Typography.Title level={4} type="secondary">
                {title}
            </Typography.Title>
            <Text type="secondary" style={{ marginBottom: '24px' }}>
                {description}
            </Text>
            {showRetry && onRetry && (
                <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={onRetry}
                >
                    Tentar Novamente
                </Button>
            )}
        </div>
    );
};

// Estado offline
export const OfflineState = ({ onRetry }) => {
    return (
        <ErrorState
            title="Você está offline"
            description="Verifique sua conexão com a internet e tente novamente"
            onRetry={onRetry}
            icon={<DisconnectOutlined />}
        />
    );
};

// Estado vazio customizado
export const EmptyState = ({
    title = 'Nenhum item encontrado',
    description = 'Não há dados para exibir',
    action,
    image = Empty.PRESENTED_IMAGE_SIMPLE
}) => {
    return (
        <Empty
            image={image}
            imageStyle={{ height: 100 }}
            description={
                <Space direction="vertical" size="small">
                    <Text strong>{title}</Text>
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                        {description}
                    </Text>
                </Space>
            }
        >
            {action}
        </Empty>
    );
};

// Loading com progress para uploads/downloads
export const ProgressLoading = ({
    percent = 0,
    status = 'active',
    text = 'Processando...'
}) => {
    return (
        <div style={{
            textAlign: 'center',
            padding: '32px 24px'
        }}>
            <div style={{ marginBottom: '16px' }}>
                <CustomSpin size="large" />
            </div>
            <div style={{ marginBottom: '8px' }}>
                <Text>{text}</Text>
            </div>
            <div style={{ width: '200px', margin: '0 auto' }}>
                <div style={{
                    height: '4px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%',
                        backgroundColor: status === 'exception' ? '#ff4d4f' : '#1890ff',
                        width: `${percent}%`,
                        transition: 'width 0.3s ease'
                    }} />
                </div>
            </div>
            <div style={{ marginTop: '8px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                    {percent}%
                </Text>
            </div>
        </div>
    );
};

// Loading para botões
export const ButtonLoading = ({ loading, children, ...props }) => {
    return (
        <Button
            {...props}
            loading={loading}
            icon={loading ? <LoadingOutlined /> : props.icon}
        >
            {children}
        </Button>
    );
};

// Success state para confirmações
export const SuccessState = ({
    title = 'Sucesso!',
    description = 'Operação realizada com sucesso',
    action
}) => {
    return (
        <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <div style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }}>
                <CheckCircleOutlined />
            </div>
            <Typography.Title level={4} style={{ color: '#52c41a' }}>
                {title}
            </Typography.Title>
            <Text type="secondary" style={{ marginBottom: '24px' }}>
                {description}
            </Text>
            {action}
        </div>
    );
};

export default {
    CustomSpin,
    TodoListLoading,
    TodoGridLoading,
    PageLoading,
    InlineLoading,
    ErrorState,
    OfflineState,
    EmptyState,
    ProgressLoading,
    ButtonLoading,
    SuccessState
}; 