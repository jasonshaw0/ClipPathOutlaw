import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useSettingsStore } from '../store/settings';

export const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useSettingsStore();

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    const isDark = theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <>
            <button
                className="theme-toggle"
                onClick={toggleTheme}
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <style>{`
                .theme-toggle {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    background: var(--bg);
                    border: 1px solid var(--line);
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    color: var(--text-muted);
                    transition: all 0.2s ease;
                }
                .theme-toggle:hover {
                    background: var(--accent-bg);
                    border-color: var(--accent);
                    color: var(--accent);
                }
                .theme-toggle:active {
                    transform: scale(0.95);
                }
            `}</style>
        </>
    );
};
