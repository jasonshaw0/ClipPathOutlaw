import React from 'react';
import { useProjectStore } from '../../store/project';

import { getSvgPathFromStroke } from '../../core/processing';

export const StrokesLayer: React.FC<{ zoom: number, pan: { x: number, y: number } }> = React.memo(() => {
    const strokes = useProjectStore(s => s.strokes);

    return (
        <g className="strokes-layer">
            {strokes.map(stroke => (
                <path
                    key={stroke.id}
                    d={getSvgPathFromStroke(stroke)}
                    fill="none"
                    stroke={stroke.color}
                    strokeWidth={stroke.width}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.8}
                    style={{ pointerEvents: 'none' }}
                />
            ))}
        </g>
    );
});
