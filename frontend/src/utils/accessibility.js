// Utilitários de acessibilidade para melhorar a experiência do usuário

// Detectar se o usuário prefere movimento reduzido
export const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Detectar tema preferido do usuário
export const prefersColorScheme = () => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
    }
    return 'auto';
};

// Gerenciar foco programaticamente
export const manageFocus = {
    // Mover foco para elemento específico
    moveTo: (selector) => {
        const element = document.querySelector(selector);
        if (element) {
            element.focus();
            // Adicionar outline visível para usuários de teclado
            element.style.outline = '2px solid #1890ff';
            element.style.outlineOffset = '2px';
        }
    },

    // Capturar foco em container (útil para modais)
    trapIn: (container) => {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        container.addEventListener('keydown', handleTabKey);
        firstElement.focus();

        return () => container.removeEventListener('keydown', handleTabKey);
    },

    // Restaurar foco anterior
    restore: (previousElement) => {
        if (previousElement && typeof previousElement.focus === 'function') {
            previousElement.focus();
        }
    }
};

// Anunciar mudanças para leitores de tela
export const announceToScreenReader = (message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcement.textContent = message;

    // Remover após anúncio
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
};

// Gerar IDs únicos para elementos
export const generateUniqueId = (prefix = 'id') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Verificar se elemento está visível
export const isElementVisible = (element) => {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

// Scroll suave para elemento
export const scrollToElement = (selector, options = {}) => {
    const element = document.querySelector(selector);
    if (!element) return;

    const defaultOptions = {
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'center',
        inline: 'nearest'
    };

    element.scrollIntoView({ ...defaultOptions, ...options });
};

// Atalhos de teclado globais
export const keyboardShortcuts = {
    // Registrar atalho
    register: (key, callback, options = {}) => {
        const handler = (e) => {
            const { ctrlKey = false, altKey = false, shiftKey = false } = options;

            if (
                e.key.toLowerCase() === key.toLowerCase() &&
                e.ctrlKey === ctrlKey &&
                e.altKey === altKey &&
                e.shiftKey === shiftKey
            ) {
                e.preventDefault();
                callback(e);
            }
        };

        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    },

    // Atalhos comuns para a aplicação
    registerCommonShortcuts: () => {
        const shortcuts = [];

        // Alt + 1: Ir para lista de todos
        shortcuts.push(
            keyboardShortcuts.register('1', () => {
                scrollToElement('#todos-list');
                announceToScreenReader('Navegando para lista de tarefas');
            }, { altKey: true })
        );

        // Alt + 2: Ir para formulário
        shortcuts.push(
            keyboardShortcuts.register('2', () => {
                scrollToElement('#todo-form');
                announceToScreenReader('Navegando para formulário');
            }, { altKey: true })
        );

        // Alt + S: Buscar
        shortcuts.push(
            keyboardShortcuts.register('s', () => {
                const searchInput = document.querySelector('#search-input');
                if (searchInput) {
                    searchInput.focus();
                    announceToScreenReader('Campo de busca focado');
                }
            }, { altKey: true })
        );

        // Escape: Limpar busca
        shortcuts.push(
            keyboardShortcuts.register('Escape', () => {
                const searchInput = document.querySelector('#search-input');
                if (searchInput && searchInput.value) {
                    searchInput.value = '';
                    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    announceToScreenReader('Busca limpa');
                }
            })
        );

        return () => {
            shortcuts.forEach(cleanup => cleanup());
        };
    }
};

// Validação de contraste de cor (simplificada)
export const colorContrast = {
    // Calcular luminância relativa
    getLuminance: (hex) => {
        const rgb = parseInt(hex.slice(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;

        const [rs, gs, bs] = [r, g, b].map(c => {
            c /= 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    },

    // Calcular razão de contraste
    getRatio: (color1, color2) => {
        const lum1 = colorContrast.getLuminance(color1);
        const lum2 = colorContrast.getLuminance(color2);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    },

    // Verificar se contraste é adequado
    isAccessible: (foreground, background, level = 'AA') => {
        const ratio = colorContrast.getRatio(foreground, background);
        return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
    }
};

// Hook personalizado para acessibilidade
export const useAccessibility = () => {
    return {
        prefersReducedMotion: prefersReducedMotion(),
        preferredColorScheme: prefersColorScheme(),
        manageFocus,
        announceToScreenReader,
        generateUniqueId,
        isElementVisible,
        scrollToElement,
        keyboardShortcuts,
        colorContrast
    };
};

export default {
    prefersReducedMotion,
    prefersColorScheme,
    manageFocus,
    announceToScreenReader,
    generateUniqueId,
    isElementVisible,
    scrollToElement,
    keyboardShortcuts,
    colorContrast,
    useAccessibility
}; 