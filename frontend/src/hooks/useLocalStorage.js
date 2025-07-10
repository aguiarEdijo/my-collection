import { useState, useEffect, useCallback } from 'react';

const useLocalStorage = (key, initialValue) => {
    // Função para obter valor do localStorage
    const getStoredValue = useCallback(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Erro ao ler localStorage para a chave "${key}":`, error);
            return initialValue;
        }
    }, [key, initialValue]);

    const [storedValue, setStoredValue] = useState(getStoredValue);

    // Função para atualizar o valor
    const setValue = useCallback((value) => {
        try {
            // Permitir que value seja uma função para manter a mesma API do useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            setStoredValue(valueToStore);

            // Salvar no localStorage
            if (valueToStore === undefined) {
                window.localStorage.removeItem(key);
            } else {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }

            // Disparar evento customizado para sincronizar entre abas
            window.dispatchEvent(new CustomEvent('localStorage', {
                detail: { key, value: valueToStore }
            }));

        } catch (error) {
            console.warn(`Erro ao salvar no localStorage para a chave "${key}":`, error);
        }
    }, [key, storedValue]);

    // Sincronizar entre abas/janelas
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === key) {
                try {
                    const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
                    setStoredValue(newValue);
                } catch (error) {
                    console.warn(`Erro ao sincronizar localStorage para a chave "${key}":`, error);
                }
            }
        };

        const handleCustomStorageChange = (e) => {
            if (e.detail.key === key) {
                setStoredValue(e.detail.value);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('localStorage', handleCustomStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('localStorage', handleCustomStorageChange);
        };
    }, [key, initialValue]);

    // Função para remover do localStorage
    const removeValue = useCallback(() => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);

            window.dispatchEvent(new CustomEvent('localStorage', {
                detail: { key, value: undefined }
            }));
        } catch (error) {
            console.warn(`Erro ao remover do localStorage para a chave "${key}":`, error);
        }
    }, [key, initialValue]);

    return [storedValue, setValue, removeValue];
};

export default useLocalStorage; 