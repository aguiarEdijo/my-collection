import { useState, useCallback } from 'react';
import { message } from 'antd';

const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (apiCall, options = {}) => {
        const {
            showErrorMessage = true,
            showSuccessMessage = false,
            successMessage = 'Operação realizada com sucesso!',
            onSuccess,
            onError,
            retries = 0,
            retryDelay = 1000
        } = options;

        setLoading(true);
        setError(null);

        let attempt = 0;

        while (attempt <= retries) {
            try {
                const result = await apiCall();

                if (showSuccessMessage) {
                    message.success(successMessage);
                }

                if (onSuccess) {
                    onSuccess(result);
                }

                setLoading(false);
                return result;

            } catch (err) {
                attempt++;

                if (attempt > retries) {
                    const errorMessage = err.response?.data?.detail ||
                        err.message ||
                        'Erro inesperado. Tente novamente.';

                    setError(errorMessage);

                    if (showErrorMessage) {
                        message.error(errorMessage);
                    }

                    if (onError) {
                        onError(err);
                    }

                    setLoading(false);
                    throw err;
                }

                // Aguardar antes de tentar novamente
                if (attempt <= retries) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
                }
            }
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        loading,
        error,
        execute,
        clearError
    };
};

export default useApi; 