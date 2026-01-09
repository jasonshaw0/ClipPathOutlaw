import { create } from 'zustand';

// Types for AI configuration
type SafetyLevel = 'BLOCK_NONE' | 'BLOCK_LOW_AND_ABOVE' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_ONLY_HIGH';

interface SettingsState {
    // Theme
    theme: 'light' | 'dark' | 'system';

    // AI Model Configuration
    aiModel: string;
    temperature: number;
    maxOutputTokens: number;
    topP: number;
    topK: number;

    // AI Behavior
    streamingEnabled: boolean;
    autoFallback: boolean;
    debugMode: boolean;
    confidenceThreshold: number;

    requestTimeout: number; // ms
    autoRetry: boolean;
    maxRetries: number;

    // AI Prompt Configuration
    customSystemPrompt: string;
    jsonStrictMode: boolean;
    shapeSimplificationMode: 'basic' | 'advanced';

    // Safety Settings
    safetyHarassment: SafetyLevel;
    safetyHateSpeech: SafetyLevel;
    safetyDangerous: SafetyLevel;
    safetySexuallyExplicit: SafetyLevel;

    // Actions
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    updateAiSettings: (settings: Partial<Omit<SettingsState, 'setTheme' | 'updateAiSettings' | 'resetToDefaults'>>) => void;
    resetToDefaults: () => void;
}

const STORAGE_KEY = 'appSettings';

const defaultSettings: Omit<SettingsState, 'setTheme' | 'updateAiSettings' | 'resetToDefaults'> = {
    theme: 'light',
    aiModel: 'gemini-3.0-pro', // Updated default to Pro
    temperature: 0.4, // Lowered default for precision
    maxOutputTokens: 2048,
    topP: 0.95,
    topK: 40,
    streamingEnabled: true,
    autoFallback: true,
    debugMode: false,
    confidenceThreshold: 0.7,
    requestTimeout: 20000,
    autoRetry: true,
    maxRetries: 2,
    customSystemPrompt: '',
    jsonStrictMode: true,
    shapeSimplificationMode: 'basic',
    safetyHarassment: 'BLOCK_MEDIUM_AND_ABOVE',
    safetyHateSpeech: 'BLOCK_MEDIUM_AND_ABOVE',
    safetyDangerous: 'BLOCK_MEDIUM_AND_ABOVE',
    safetySexuallyExplicit: 'BLOCK_MEDIUM_AND_ABOVE',
};

// Load persisted settings
function loadSettings(): Partial<typeof defaultSettings> {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Failed to load settings:', e);
    }
    return {};
}

// Save settings to localStorage
function persistSettings(state: Partial<typeof defaultSettings>) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to persist settings:', e);
    }
}

export const useSettingsStore = create<SettingsState>((set, get) => {
    const persisted = loadSettings();
    const initial = { ...defaultSettings, ...persisted };

    return {
        ...initial,

        setTheme: (theme) => {
            set({ theme });
            const state = get();
            persistSettings(state);
            applyTheme(theme);
        },

        updateAiSettings: (settings) => {
            set(settings);
            const state = get();
            persistSettings(state);
        },

        resetToDefaults: () => {
            set(defaultSettings);
            persistSettings(defaultSettings);
            applyTheme(defaultSettings.theme);
        },
    };
});

// Apply theme to document
export function applyTheme(theme: 'light' | 'dark' | 'system') {
    const root = document.documentElement;

    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
        root.setAttribute('data-theme', theme);
    }
}

// Initialize theme on load
export function initTheme() {
    const theme = useSettingsStore.getState().theme;
    applyTheme(theme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const currentTheme = useSettingsStore.getState().theme;
        if (currentTheme === 'system') {
            applyTheme('system');
        }
    });
}
