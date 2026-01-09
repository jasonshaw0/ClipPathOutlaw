import { create } from 'zustand';
import { simplifyStroke, smoothStroke, getSvgPathFromStroke } from '../core/processing';


// Re-export Immer produce for convenience if needed, 
// or simpler: just use a middleware or functional updates. 
// I'll stick to simple immutable updates or use immer if I install it. 
// I didn't install immer. I'll code carefully or install it. 
// Actually, for complex CAD state, immer is a lifesaver.
// I'll assume I can use spread operators for now to keep deps low, or I'll install immer if it gets messy.

export type Point = { x: number; y: number };

export type OpType =
    | 'shape_rect'
    | 'shape_circle'
    | 'shape_poly'
    | 'shape_polygon'  // Regular n-sided polygon
    | 'shape_star'
    | 'shape_custom'   // Custom SVG path
    | 'op_union'
    | 'op_subtract'
    | 'op_intersect'
    | 'op_xor'         // Exclusive OR
    | 'mod_offset'
    | 'mod_fillet'     // Corner radius
    | 'mod_smooth';

// Base interface for all operations
export interface OperationNode {
    id: string;
    type: OpType;
    name: string;
    visible: boolean;
    locked: boolean;
    // Parameters specific to the OpType
    params: Record<string, any>;
    // For grouping or inputs
    children?: OperationNode[];
}

interface ProjectState {
    stack: OperationNode[];
    selection: string | null;
    strokeSettings: {
        simplifyTolerance: number;
        smoothIterations: number;
    };
    strokes: Stroke[];
    historyIndex: number;
    history: ProjectState[];

    // AI State
    aiLoading: boolean;
    aiError: string | null;

    // Actions
    addNode: (node: OperationNode, parentId?: string) => void;
    removeNode: (id: string) => void;
    updateNode: (id: string, updates: Partial<OperationNode>) => void;
    setSelection: (id: string | null) => void;
    moveNode: (id: string, newParentId: string | undefined, index: number) => void;

    // Stroke Actions
    addStroke: (stroke: Stroke) => void;
    clearStrokes: () => void;
    setStrokeSettings: (settings: Partial<{ simplifyTolerance: number; smoothIterations: number }>) => void;
    bakeStrokesToNodes: () => void;
    aiBakeStrokes: () => Promise<void>;
    clearAiError: () => void;

    // History Actions
    undo: () => void;
    redo: () => void;
    snapshot: () => void;
}

import { recognizeStrokes } from '../services/gemini';

export const useProjectStore = create<ProjectState>((set, get) => ({
    stack: [],
    selection: null,
    strokeSettings: {
        simplifyTolerance: 2.0,
        smoothIterations: 1
    },
    strokes: [],
    historyIndex: -1,
    history: [],
    aiLoading: false,
    aiError: null,

    setStrokeSettings: (settings) => set((state) => ({
        strokeSettings: { ...state.strokeSettings, ...settings }
    })),

    snapshot: () => {
        set((state) => {
            // Limit history size to 50
            const newHistory = state.history.slice(0, state.historyIndex + 1);
            newHistory.push({ ...state, history: [] }); // Store copy of current state (minus history itself)
            if (newHistory.length > 50) newHistory.shift();
            return {
                history: newHistory,
                historyIndex: newHistory.length - 1
            };
        });
    },

    addNode: (node, parentId) => {
        get().snapshot();
        set((state) => {
            // DFS to find parent and add
            if (!parentId) {
                return { stack: [...state.stack, node] };
            }
            // TODO: Implement deep insert
            return state;
        });
    },

    removeNode: (id) => {
        get().snapshot();
        set((state) => {
            const filterNodes = (nodes: OperationNode[]): OperationNode[] => {
                return nodes.filter(n => n.id !== id).map(n => ({
                    ...n,
                    children: n.children ? filterNodes(n.children) : undefined
                }));
            };
            return { stack: filterNodes(state.stack) };
        });
    },

    updateNode: (id, updates) => {
        get().snapshot();
        set((state) => {
            const updateNodes = (nodes: OperationNode[]): OperationNode[] => {
                return nodes.map(n => {
                    if (n.id === id) {
                        return { ...n, ...updates };
                    }
                    if (n.children) {
                        return { ...n, children: updateNodes(n.children) };
                    }
                    return n;
                });
            };
            return { stack: updateNodes(state.stack) };
        });
    },

    setSelection: (id) => set({ selection: id }),

    moveNode: (_id, _newParentId, _index) => {
        get().snapshot();
        set((state) => {
            // Complex moves involve removing then inserting. 
            // Implementing basic placeholder for now.
            return state;
        });
    },

    addStroke: (stroke) => {
        // strokes are transient often, but we might want to undo them if they are "committed"
        // For now, let's say a completed stroke is an undoable action
        get().snapshot();
        set((state) => {
            let processedStroke = { ...stroke };
            // Apply processing functions if the stroke is completed
            if (processedStroke.completed) {
                const { simplifyTolerance, smoothIterations } = get().strokeSettings;
                processedStroke.points = simplifyStroke(processedStroke.points, simplifyTolerance);
                processedStroke.points = smoothStroke(processedStroke.points, smoothIterations);
            }
            return { strokes: [...state.strokes, processedStroke] };
        });
    },

    bakeStrokesToNodes: () => {
        const state = get();
        if (state.strokes.length === 0) return;

        state.snapshot();

        set((state) => {
            const newNodes: OperationNode[] = state.strokes.map((stroke, i) => ({
                id: crypto.randomUUID(),
                type: 'shape_custom',
                name: `Freehand ${i + 1}`,
                visible: true,
                locked: false,
                params: {
                    x: 0,
                    y: 0,
                    pathData: getSvgPathFromStroke(stroke)
                }
            }));

            return {
                stack: [...state.stack, ...newNodes],
                strokes: [], // Clear baked strokes
                selection: newNodes[newNodes.length - 1].id // Select last one
            };
        });
    },

    clearStrokes: () => {
        get().snapshot();
        set({ strokes: [] });
    },

    undo: () => set((state) => {
        if (state.historyIndex < 0) return state;
        const prev = state.history[state.historyIndex];
        return {
            ...prev,
            history: state.history, // keep history intact
            historyIndex: state.historyIndex - 1
        };
    }),

    redo: () => set((state) => {
        if (state.historyIndex >= state.history.length - 1) return state;
        const next = state.history[state.historyIndex + 1];
        return {
            ...next,
            history: state.history,
            historyIndex: state.historyIndex + 1
        };
    }),

    clearAiError: () => set({ aiError: null }),

    aiBakeStrokes: async () => {
        const state = get();
        if (state.strokes.length === 0) return;

        set({ aiLoading: true, aiError: null });

        try {
            const nodes = await recognizeStrokes(state.strokes);

            state.snapshot();
            set((s) => ({
                stack: [...s.stack, ...nodes],
                strokes: [],
                selection: nodes.length > 0 ? nodes[nodes.length - 1].id : s.selection,
                aiLoading: false
            }));
        } catch (error) {
            console.error('AI Bake failed:', error);
            set({
                aiLoading: false,
                aiError: error instanceof Error ? error.message : 'AI recognition failed'
            });
            // Fallback to manual bake
            get().bakeStrokesToNodes();
        }
    },
}));

export type StrokePoint = { x: number; y: number; pressure: number; time: number };
export type Stroke = {
    id: string;
    points: StrokePoint[];
    completed: boolean;
    color: string;
    width: number;
};
