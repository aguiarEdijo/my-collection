import { useState, useEffect } from 'react';

const useDebounce = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Configurar o timer
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Limpar o timer se value mudar antes do delay completar
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default useDebounce; 