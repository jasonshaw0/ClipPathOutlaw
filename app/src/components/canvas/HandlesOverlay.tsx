import React, { useRef, useEffect, useState } from 'react';
import { useProjectStore } from '../../store/project';

/**
 * Handle Types:
 * - pos: Position/move handle (drag entire shape)
 * - resize: Corner resize handles
 * - radius: Corner radius control
 * - edge-slide: Constrained movement along an edge
 * - distance: Control distance/gap between elements
 * - rotation: Rotation handle
 */
type HandleType = 'pos' | 'resize' | 'radius' | 'edge-slide' | 'distance' | 'rotation';

// Constraint type for dragging
type DragConstraint = {
    axis?: 'x' | 'y';
    min?: number;
    max?: number;
};

type DragStateData = {
    active: boolean;
    nodeId: string;
    handleId: string;
    handleType: HandleType;
    startX: number;
    startY: number;
    initialParams: Record<string, any>;
    constraint?: DragConstraint;
};

type DragState = DragStateData | null;

// Helpers

export const HandlesOverlay: React.FC<{ zoom: number, pan: { x: number, y: number } }> = ({ zoom }) => {
    const selection = useProjectStore(s => s.selection);
    const stack = useProjectStore(s => s.stack);
    const selectedNode = stack.find(n => n.id === selection);

    const dragState = useRef<DragState>(null);
    const [activeHandle, setActiveHandle] = useState<string | null>(null);
    const [shiftHeld, setShiftHeld] = useState(false);

    // Shift key detection for constrained movement
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => setShiftHeld(e.shiftKey);
        window.addEventListener('keydown', onKey);
        window.addEventListener('keyup', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('keyup', onKey);
        };
    }, []);

    // Global mouse up/move listeners
    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            const current = dragState.current;
            if (!current || !current.active) return;

            let dx = (e.clientX - current.startX) / zoom;
            let dy = (e.clientY - current.startY) / zoom;

            // Apply constraints
            if (current.constraint?.axis === 'x') dy = 0;
            if (current.constraint?.axis === 'y') dx = 0;
            if (shiftHeld) {
                // Constrain to 45° angles
                if (Math.abs(dx) > Math.abs(dy)) dy = 0;
                else dx = 0;
            }

            const newParams = { ...current.initialParams };
            const { handleId, handleType, nodeId } = current;

            const state = useProjectStore.getState();
            const node = state.stack.find(n => n.id === nodeId);
            if (!node) return;

            // Apply handle-specific transformations
            if (node.type === 'shape_rect') {
                switch (handleType) {
                    case 'pos':
                        newParams.x = current.initialParams.x + dx;
                        newParams.y = current.initialParams.y + dy;
                        break;
                    case 'resize':
                        if (handleId === 'resize-br') {
                            newParams.width = Math.max(20, current.initialParams.width + dx);
                            newParams.height = Math.max(20, current.initialParams.height + dy);
                        } else if (handleId === 'resize-bl') {
                            const widthDelta = -dx;
                            newParams.x = current.initialParams.x + dx;
                            newParams.width = Math.max(20, current.initialParams.width + widthDelta);
                            newParams.height = Math.max(20, current.initialParams.height + dy);
                        } else if (handleId === 'resize-tr') {
                            const heightDelta = -dy;
                            newParams.y = current.initialParams.y + dy;
                            newParams.width = Math.max(20, current.initialParams.width + dx);
                            newParams.height = Math.max(20, current.initialParams.height + heightDelta);
                        } else if (handleId === 'resize-tl') {
                            newParams.x = current.initialParams.x + dx;
                            newParams.y = current.initialParams.y + dy;
                            newParams.width = Math.max(20, current.initialParams.width - dx);
                            newParams.height = Math.max(20, current.initialParams.height - dy);
                        }
                        break;
                    case 'radius':
                        const maxRadius = Math.min(current.initialParams.width, current.initialParams.height) / 2;
                        newParams.radius = Math.max(0, Math.min(maxRadius, current.initialParams.radius + dx));
                        break;
                    case 'edge-slide':
                        // Slide along top edge
                        const minX = current.initialParams.x;
                        const maxX = current.initialParams.x + current.initialParams.width;
                        if (handleId.includes('top')) {
                            newParams._slidePos = Math.max(minX, Math.min(maxX, (current.initialParams._slidePos || minX + 50) + dx));
                        }
                        break;
                }
            } else if (node.type === 'shape_circle' || (node.type.startsWith('op_') && newParams.shapeType === 'circle')) {
                switch (handleType) {
                    case 'pos':
                        newParams.x = current.initialParams.x + dx;
                        newParams.y = current.initialParams.y + dy;
                        break;
                    case 'radius':
                        newParams.radius = Math.max(5, current.initialParams.radius + dx);
                        break;
                    case 'distance':
                        // For distance handles between objects
                        newParams._distance = Math.max(0, (current.initialParams._distance || 0) + dx);
                        break;
                }
            }

            state.updateNode(nodeId, { params: newParams });
        };

        const handleUp = () => {
            setActiveHandle(null);
            dragState.current = null;
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [zoom, shiftHeld]);

    if (!selectedNode) return null;

    const onHandleDown = (e: React.MouseEvent, handleId: string, handleType: HandleType, constraint?: DragConstraint) => {
        e.stopPropagation();
        e.preventDefault();
        setActiveHandle(handleId);
        dragState.current = {
            active: true,
            nodeId: selectedNode.id,
            handleId,
            handleType,
            startX: e.clientX,
            startY: e.clientY,
            initialParams: { ...selectedNode.params },
            constraint
        };
    };

    const renderHandles = () => {
        const p = selectedNode.params;
        const handles: React.ReactNode[] = [];
        const handleSize = 6 / zoom;
        const strokeWidth = 1.5 / zoom;

        // Color scheme
        const colors = {
            pos: '#2563eb',
            resize: '#2563eb',
            radius: '#10b981',
            edge: '#f59e0b',
            distance: '#8b5cf6',
            rotation: '#ec4899'
        };

        // Circle handle helper
        const circleHandle = (id: string, x: number, y: number, type: HandleType, cursor: string, color: string, constraint?: DragConstraint) => (
            <circle
                key={id}
                cx={x}
                cy={y}
                r={handleSize}
                fill={activeHandle === id ? color : 'white'}
                stroke={color}
                strokeWidth={strokeWidth}
                style={{ cursor }}
                onMouseDown={(e) => onHandleDown(e, id, type, constraint)}
            />
        );

        // Square handle helper
        const squareHandle = (id: string, x: number, y: number, type: HandleType, cursor: string, color: string) => (
            <rect
                key={id}
                x={x - handleSize}
                y={y - handleSize}
                width={handleSize * 2}
                height={handleSize * 2}
                fill={activeHandle === id ? color : 'white'}
                stroke={color}
                strokeWidth={strokeWidth}
                style={{ cursor }}
                onMouseDown={(e) => onHandleDown(e, id, type)}
            />
        );

        // Diamond handle helper
        const diamondHandle = (id: string, x: number, y: number, type: HandleType, cursor: string, color: string) => {
            const size = handleSize * 1.2;
            const points = `${x},${y - size} ${x + size},${y} ${x},${y + size} ${x - size},${y}`;
            return (
                <polygon
                    key={id}
                    points={points}
                    fill={activeHandle === id ? color : 'white'}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    style={{ cursor }}
                    onMouseDown={(e) => onHandleDown(e, id, type)}
                />
            );
        };

        if (selectedNode.type === 'shape_rect') {
            const { x, y, width, height, radius = 0 } = p;

            // Position handle (center)
            handles.push(
                circleHandle('pos', x + width / 2, y + height / 2, 'pos', 'move', colors.pos)
            );

            // Corner resize handles
            handles.push(squareHandle('resize-tl', x, y, 'resize', 'nwse-resize', colors.resize));
            handles.push(squareHandle('resize-tr', x + width, y, 'resize', 'nesw-resize', colors.resize));
            handles.push(squareHandle('resize-bl', x, y + height, 'resize', 'nesw-resize', colors.resize));
            handles.push(squareHandle('resize-br', x + width, y + height, 'resize', 'nwse-resize', colors.resize));

            // Edge midpoint handles for proportional resize
            handles.push(squareHandle('resize-t', x + width / 2, y, 'resize', 'ns-resize', colors.resize));
            handles.push(squareHandle('resize-b', x + width / 2, y + height, 'resize', 'ns-resize', colors.resize));
            handles.push(squareHandle('resize-l', x, y + height / 2, 'resize', 'ew-resize', colors.resize));
            handles.push(squareHandle('resize-r', x + width, y + height / 2, 'resize', 'ew-resize', colors.resize));

            // Radius handle (at top-left corner, offset by radius)
            if (radius > 0) {
                const radiusHandleX = x + radius;
                const radiusHandleY = y;
                handles.push(
                    <g key="radius-group">
                        <line
                            x1={x}
                            y1={y}
                            x2={radiusHandleX}
                            y2={radiusHandleY}
                            stroke={colors.radius}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${4 / zoom} ${2 / zoom}`}
                            pointerEvents="none"
                        />
                        {diamondHandle('radius', radiusHandleX, radiusHandleY, 'radius', 'ew-resize', colors.radius)}
                    </g>
                );
            } else {
                handles.push(diamondHandle('radius', x + 12 / zoom, y, 'radius', 'ew-resize', colors.radius));
            }

            // Bounding box
            handles.unshift(
                <rect
                    key="bbox"
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill="none"
                    stroke={colors.pos}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${4 / zoom} ${2 / zoom}`}
                    pointerEvents="none"
                />
            );
        }
        else if (selectedNode.type === 'shape_circle' || (selectedNode.type.startsWith('op_') && p.shapeType === 'circle')) {
            const { x, y, radius } = p;

            // Center position handle
            handles.push(circleHandle('pos', x, y, 'pos', 'move', colors.pos));

            // Radius handles (4 directions)
            handles.push(circleHandle('radius-r', x + radius, y, 'radius', 'ew-resize', colors.radius));
            handles.push(circleHandle('radius-l', x - radius, y, 'radius', 'ew-resize', colors.radius));
            handles.push(circleHandle('radius-t', x, y - radius, 'radius', 'ns-resize', colors.radius));
            handles.push(circleHandle('radius-b', x, y + radius, 'radius', 'ns-resize', colors.radius));

            // Radius guide lines
            handles.unshift(
                <g key="guides" pointerEvents="none">
                    <circle
                        cx={x}
                        cy={y}
                        r={radius}
                        fill="none"
                        stroke={colors.pos}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${4 / zoom} ${2 / zoom}`}
                    />
                    <line x1={x} y1={y} x2={x + radius} y2={y} stroke={colors.radius} strokeWidth={strokeWidth} opacity={0.5} />
                </g>
            );
        }
        else if (selectedNode.type.startsWith('op_') && p.shapeType === 'rect') {
            const { x, y, width, height } = p;

            // Position handle
            handles.push(circleHandle('pos', x + width / 2, y + height / 2, 'pos', 'move', colors.pos));

            // Corner handles
            handles.push(squareHandle('resize-br', x + width, y + height, 'resize', 'nwse-resize', colors.resize));

            // Bounding box
            handles.unshift(
                <rect
                    key="bbox"
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill="none"
                    stroke={colors.pos}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${4 / zoom} ${2 / zoom}`}
                    pointerEvents="none"
                    opacity={0.7}
                />
            );
        }

        return handles;
    };

    return (
        <g className="handles-overlay">
            {renderHandles()}
            <style>{`
                .handles-overlay circle,
                .handles-overlay rect,
                .handles-overlay polygon {
                    transition: fill 0.1s ease;
                }
                .handles-overlay circle:hover,
                .handles-overlay rect:hover,
                .handles-overlay polygon:hover {
                    filter: brightness(1.1);
                }
            `}</style>
        </g>
    );
};
