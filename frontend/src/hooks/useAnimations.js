import { useState, useEffect, useCallback } from 'react';

const useAnimations = () => {
    const [isAnimating, setIsAnimating] = useState(false);

    // Animação de fade in/out
    const fadeIn = useCallback((element, duration = 300) => {
        if (!element) return Promise.resolve();

        return new Promise((resolve) => {
            setIsAnimating(true);
            element.style.opacity = '0';
            element.style.transition = `opacity ${duration}ms ease-in-out`;

            // Force reflow
            element.offsetHeight;

            element.style.opacity = '1';

            setTimeout(() => {
                setIsAnimating(false);
                resolve();
            }, duration);
        });
    }, []);

    const fadeOut = useCallback((element, duration = 300) => {
        if (!element) return Promise.resolve();

        return new Promise((resolve) => {
            setIsAnimating(true);
            element.style.transition = `opacity ${duration}ms ease-in-out`;
            element.style.opacity = '0';

            setTimeout(() => {
                setIsAnimating(false);
                resolve();
            }, duration);
        });
    }, []);

    // Animação de slide
    const slideIn = useCallback((element, direction = 'left', duration = 300) => {
        if (!element) return Promise.resolve();

        return new Promise((resolve) => {
            setIsAnimating(true);

            const transforms = {
                left: 'translateX(-100%)',
                right: 'translateX(100%)',
                up: 'translateY(-100%)',
                down: 'translateY(100%)'
            };

            element.style.transform = transforms[direction];
            element.style.transition = `transform ${duration}ms ease-out`;

            // Force reflow
            element.offsetHeight;

            element.style.transform = 'translate(0, 0)';

            setTimeout(() => {
                setIsAnimating(false);
                resolve();
            }, duration);
        });
    }, []);

    // Animação de bounce
    const bounce = useCallback((element, duration = 600) => {
        if (!element) return Promise.resolve();

        return new Promise((resolve) => {
            setIsAnimating(true);
            element.style.animation = `bounce ${duration}ms ease-in-out`;

            setTimeout(() => {
                element.style.animation = '';
                setIsAnimating(false);
                resolve();
            }, duration);
        });
    }, []);

    // Animação de shake para erros
    const shake = useCallback((element, duration = 400) => {
        if (!element) return Promise.resolve();

        return new Promise((resolve) => {
            setIsAnimating(true);
            element.style.animation = `shake ${duration}ms ease-in-out`;

            setTimeout(() => {
                element.style.animation = '';
                setIsAnimating(false);
                resolve();
            }, duration);
        });
    }, []);

    // Animação de pulso para destacar
    const pulse = useCallback((element, duration = 1000) => {
        if (!element) return Promise.resolve();

        return new Promise((resolve) => {
            setIsAnimating(true);
            element.style.animation = `pulse ${duration}ms ease-in-out`;

            setTimeout(() => {
                element.style.animation = '';
                setIsAnimating(false);
                resolve();
            }, duration);
        });
    }, []);

    // Efeito de loading suave
    const loadingPulse = useCallback((element) => {
        if (!element) return;

        element.style.animation = 'pulse 1.5s ease-in-out infinite';

        return () => {
            element.style.animation = '';
        };
    }, []);

    return {
        isAnimating,
        fadeIn,
        fadeOut,
        slideIn,
        bounce,
        shake,
        pulse,
        loadingPulse
    };
};

export default useAnimations; 