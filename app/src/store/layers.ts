import { create } from 'zustand';

// Layer types for style stack (distinct from operation stack)
export type LayerType =
    | 'fill'
    | 'stroke'
    | 'inset-border'
    | 'inner-glow'
    | 'outer-glow'
    | 'specular'
    | 'shadow'
    | 'noise'
    | 'pattern'  // Micro-details
    | 'gradient';

export type BlendMode =
    | 'normal'
    | 'multiply'
    | 'screen'
    | 'overlay'
    | 'soft-light'
    | 'hard-light'
    | 'color-dodge'
    | 'color-burn'
    | 'difference'
    | 'exclusion'
    | 'hue'
    | 'saturation'
    | 'color'
    | 'luminosity';

export interface StyleLayer {
    id: string;
    type: LayerType;
    name: string;
    visible: boolean;
    locked: boolean;
    opacity: number; // 0-1
    blendMode: BlendMode;
    // Offset from base shape (for inset borders, glows, etc.)
    offset: number;
    // Type-specific params
    params: Record<string, any>;
}

// Gradient stop for gradient layers
export interface GradientStop {
    offset: number; // 0-1
    color: string;
}

// Pattern configs for micro-detail layers
export interface PatternConfig {
    patternType: 'ticks' | 'rivets' | 'perforations' | 'vents' | 'slits' | 'dots' | 'lines';
    spacing: number;
    size: number;
    count?: number;
    randomSeed: number;
    randomness: number; // 0-1, how random the placement is
    alignToEdges: boolean;
    margin: number;
    rotation: number;
}

// Default layer configurations
export const DEFAULT_LAYERS: Omit<StyleLayer, 'id'>[] = [
    {
        type: 'fill',
        name: 'Fill',
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: 'normal',
        offset: 0,
        params: { color: '#2563eb' }
    },
    {
        type: 'stroke',
        name: 'Stroke',
        visible: true,
        locked: false,
        opacity: 1,
        blendMode: 'normal',
        offset: 0,
        params: { color: '#1d4ed8', width: 2, dashArray: '' }
    }
];

interface LayersState {
    layers: StyleLayer[];
    selectedLayerId: string | null;

    // Actions
    addLayer: (layer: Omit<StyleLayer, 'id'>) => void;
    removeLayer: (id: string) => void;
    updateLayer: (id: string, updates: Partial<StyleLayer>) => void;
    reorderLayers: (fromIndex: number, toIndex: number) => void;
    selectLayer: (id: string | null) => void;
    toggleLayerVisibility: (id: string) => void;
    duplicateLayer: (id: string) => void;
    resetLayers: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);

export const useLayersStore = create<LayersState>((set) => ({
    layers: DEFAULT_LAYERS.map(l => ({ ...l, id: uid() })),
    selectedLayerId: null,

    addLayer: (layer) => set((state) => ({
        layers: [...state.layers, { ...layer, id: uid() }]
    })),

    removeLayer: (id) => set((state) => ({
        layers: state.layers.filter(l => l.id !== id),
        selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId
    })),

    updateLayer: (id, updates) => set((state) => ({
        layers: state.layers.map(l =>
            l.id === id ? { ...l, ...updates } : l
        )
    })),

    reorderLayers: (fromIndex, toIndex) => set((state) => {
        const newLayers = [...state.layers];
        const [removed] = newLayers.splice(fromIndex, 1);
        newLayers.splice(toIndex, 0, removed);
        return { layers: newLayers };
    }),

    selectLayer: (id) => set({ selectedLayerId: id }),

    toggleLayerVisibility: (id) => set((state) => ({
        layers: state.layers.map(l =>
            l.id === id ? { ...l, visible: !l.visible } : l
        )
    })),

    duplicateLayer: (id) => set((state) => {
        const layer = state.layers.find(l => l.id === id);
        if (!layer) return state;
        const dup = { ...layer, id: uid(), name: `${layer.name} Copy` };
        const idx = state.layers.findIndex(l => l.id === id);
        const newLayers = [...state.layers];
        newLayers.splice(idx + 1, 0, dup);
        return { layers: newLayers };
    }),

    resetLayers: () => set({
        layers: DEFAULT_LAYERS.map(l => ({ ...l, id: uid() })),
        selectedLayerId: null
    })
}));

// Layer presets
export const LAYER_PRESETS: Record<string, Omit<StyleLayer, 'id'>[]> = {
    'Flat': [
        { type: 'fill', name: 'Fill', visible: true, locked: false, opacity: 1, blendMode: 'normal', offset: 0, params: { color: '#3b82f6' } },
    ],
    'Outlined': [
        { type: 'fill', name: 'Fill', visible: true, locked: false, opacity: 0.1, blendMode: 'normal', offset: 0, params: { color: '#3b82f6' } },
        { type: 'stroke', name: 'Stroke', visible: true, locked: false, opacity: 1, blendMode: 'normal', offset: 0, params: { color: '#3b82f6', width: 2 } },
    ],
    'Glass Effect': [
        { type: 'fill', name: 'Glass Fill', visible: true, locked: false, opacity: 0.2, blendMode: 'normal', offset: 0, params: { color: '#ffffff' } },
        { type: 'stroke', name: 'Border', visible: true, locked: false, opacity: 0.3, blendMode: 'normal', offset: 0, params: { color: '#ffffff', width: 1 } },
        { type: 'inner-glow', name: 'Inner Glow', visible: true, locked: false, opacity: 0.4, blendMode: 'screen', offset: -4, params: { color: '#ffffff', blur: 8 } },
        { type: 'shadow', name: 'Shadow', visible: true, locked: false, opacity: 0.2, blendMode: 'multiply', offset: 4, params: { color: '#000000', blur: 20, x: 0, y: 8 } },
    ],
    'Neumorphic': [
        { type: 'fill', name: 'Base', visible: true, locked: false, opacity: 1, blendMode: 'normal', offset: 0, params: { color: '#e4e9f2' } },
        { type: 'shadow', name: 'Dark Shadow', visible: true, locked: false, opacity: 0.2, blendMode: 'multiply', offset: 0, params: { color: '#a3b1c6', blur: 15, x: 5, y: 5 } },
        { type: 'shadow', name: 'Light Shadow', visible: true, locked: false, opacity: 1, blendMode: 'normal', offset: 0, params: { color: '#ffffff', blur: 15, x: -5, y: -5 } },
    ],
    'Gradient Fill': [
        {
            type: 'gradient', name: 'Gradient', visible: true, locked: false, opacity: 1, blendMode: 'normal', offset: 0, params: {
                type: 'linear', angle: 135,
                stops: [{ offset: 0, color: '#667eea' }, { offset: 1, color: '#764ba2' }]
            }
        },
        { type: 'stroke', name: 'Border', visible: true, locked: false, opacity: 0.3, blendMode: 'normal', offset: 0, params: { color: '#ffffff', width: 1 } },
    ],
    'Inset Card': [
        { type: 'fill', name: 'Fill', visible: true, locked: false, opacity: 1, blendMode: 'normal', offset: 0, params: { color: '#f8fafc' } },
        { type: 'inset-border', name: 'Inset Border', visible: true, locked: false, opacity: 1, blendMode: 'normal', offset: -3, params: { color: '#e2e8f0', width: 1 } },
        { type: 'inner-glow', name: 'Inner Shadow', visible: true, locked: false, opacity: 0.07, blendMode: 'multiply', offset: 0, params: { color: '#000000', blur: 6 } },
    ],
    'Technical Blueprint': [
        { type: 'fill', name: 'Fill', visible: true, locked: false, opacity: 0.05, blendMode: 'normal', offset: 0, params: { color: '#3b82f6' } },
        { type: 'stroke', name: 'Main Line', visible: true, locked: false, opacity: 1, blendMode: 'normal', offset: 0, params: { color: '#3b82f6', width: 1.5 } },
        { type: 'stroke', name: 'Detail Line', visible: true, locked: false, opacity: 0.4, blendMode: 'normal', offset: -8, params: { color: '#3b82f6', width: 0.5, dashArray: '4,2' } },
        { type: 'pattern', name: 'Corner Marks', visible: true, locked: false, opacity: 0.6, blendMode: 'normal', offset: 0, params: { patternType: 'ticks', spacing: 0, count: 4, size: 12 } },
    ],
    'Metallic Panel': [
        {
            type: 'gradient', name: 'Metal Gradient', visible: true, locked: false, opacity: 1, blendMode: 'normal', offset: 0, params: {
                type: 'linear', angle: 180,
                stops: [{ offset: 0, color: '#e5e7eb' }, { offset: 0.5, color: '#9ca3af' }, { offset: 1, color: '#6b7280' }]
            }
        },
        { type: 'stroke', name: 'Edge', visible: true, locked: false, opacity: 1, blendMode: 'normal', offset: 0, params: { color: '#4b5563', width: 1 } },
        { type: 'inner-glow', name: 'Top Highlight', visible: true, locked: false, opacity: 0.5, blendMode: 'screen', offset: -2, params: { color: '#ffffff', blur: 4 } },
        { type: 'pattern', name: 'Rivets', visible: true, locked: false, opacity: 0.7, blendMode: 'normal', offset: 0, params: { patternType: 'rivets', spacing: 30, size: 4, margin: 10, alignToEdges: true } },
    ],
};
