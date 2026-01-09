import { create } from 'zustand';


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
    selection: string | null; // ID of selected node

    // Actions
    addNode: (node: OperationNode, parentId?: string) => void;
    removeNode: (id: string) => void;
    updateNode: (id: string, updates: Partial<OperationNode>) => void;
    setSelection: (id: string | null) => void;
    moveNode: (id: string, newParentId: string | undefined, index: number) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
    stack: [],
    selection: null,

    addNode: (node, parentId) => set((state) => {
        // DFS to find parent and add
        if (!parentId) {
            return { stack: [...state.stack, node] };
        }
        // TODO: Implement deep insert
        return state;
    }),

    removeNode: (id) => set((state) => {
        const filterNodes = (nodes: OperationNode[]): OperationNode[] => {
            return nodes.filter(n => n.id !== id).map(n => ({
                ...n,
                children: n.children ? filterNodes(n.children) : undefined
            }));
        };
        return { stack: filterNodes(state.stack) };
    }),

    updateNode: (id, updates) => set((state) => {
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
    }),

    setSelection: (id) => set({ selection: id }),

    moveNode: (_id, _newParentId, _index) => set((state) => {
        // Complex moves involve removing then inserting. 
        // Implementing basic placeholder for now.
        return state;
    }),
}));
