import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useProjectStore } from '../../store/project';
import { useLayersStore, type StyleLayer } from '../../store/layers';
import { evaluateStack } from '../../core/geometry';
import { HandlesOverlay } from './HandlesOverlay';

// Convert blend mode to CSS mix-blend-mode
function blendModeToCss(bm: string): string {
    const mapping: Record<string, string> = {
        'normal': 'normal',
        'multiply': 'multiply',
        'screen': 'screen',
        'overlay': 'overlay',
        'soft-light': 'soft-light',
        'hard-light': 'hard-light',
        'color-dodge': 'color-dodge',
        'color-burn': 'color-burn',
        'difference': 'difference',
        'exclusion': 'exclusion',
        'hue': 'hue',
        'saturation': 'saturation',
        'color': 'color',
        'luminosity': 'luminosity',
    };
    return mapping[bm] || 'normal';
}

// Generate unique ID for SVG defs
let defIdCounter = 0;
const genDefId = (prefix: string) => `${prefix}-${++defIdCounter}`;

// Render a single layer as SVG elements
function renderLayer(
    layer: StyleLayer,
    pathData: string,
    _index: number
): React.ReactNode {
    if (!layer.visible || !pathData) return null;

    const key = `layer-${layer.id}`;
    const opacity = layer.opacity;
    const blendMode = blendModeToCss(layer.blendMode);

    switch (layer.type) {
        case 'fill':
            return (
                <path
                    key={key}
                    d={pathData}
                    fill={layer.params.color}
                    fillOpacity={opacity}
                    fillRule="evenodd"
                    style={{ mixBlendMode: blendMode as any }}
                />
            );

        case 'stroke':
            return (
                <path
                    key={key}
                    d={pathData}
                    fill="none"
                    stroke={layer.params.color}
                    strokeWidth={layer.params.width || 2}
                    strokeOpacity={opacity}
                    strokeDasharray={layer.params.dashArray || undefined}
                    style={{ mixBlendMode: blendMode as any }}
                />
            );

        case 'inset-border':
            // For inset borders, we'd need an offset path (complex)
            // For now, simulate with a thinner stroke inside
            return (
                <path
                    key={key}
                    d={pathData}
                    fill="none"
                    stroke={layer.params.color}
                    strokeWidth={layer.params.width || 1}
                    strokeOpacity={opacity}
                    style={{ mixBlendMode: blendMode as any }}
                    transform={`translate(${-layer.offset}, ${-layer.offset})`}
                />
            );

        case 'shadow': {
            const filterId = genDefId('shadow');
            const blur = layer.params.blur || 10;
            const dx = layer.params.x || 0;
            const dy = layer.params.y || 8;
            return (
                <g key={key}>
                    <defs>
                        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow
                                dx={dx}
                                dy={dy}
                                stdDeviation={blur / 2}
                                floodColor={layer.params.color || '#000000'}
                                floodOpacity={opacity}
                            />
                        </filter>
                    </defs>
                    <path
                        d={pathData}
                        fill="transparent"
                        filter={`url(#${filterId})`}
                        style={{ mixBlendMode: blendMode as any }}
                    />
                </g>
            );
        }

        case 'inner-glow': {
            const filterId = genDefId('inner-glow');
            const blur = layer.params.blur || 8;
            return (
                <g key={key}>
                    <defs>
                        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation={blur / 2} result="blur" />
                            <feComposite in="blur" in2="SourceGraphic" operator="in" />
                        </filter>
                    </defs>
                    <path
                        d={pathData}
                        fill={layer.params.color || '#ffffff'}
                        fillOpacity={opacity}
                        filter={`url(#${filterId})`}
                        style={{ mixBlendMode: blendMode as any }}
                    />
                </g>
            );
        }

        case 'outer-glow': {
            const filterId = genDefId('outer-glow');
            const blur = layer.params.blur || 12;
            return (
                <g key={key}>
                    <defs>
                        <filter id={filterId} x="-100%" y="-100%" width="300%" height="300%">
                            <feGaussianBlur stdDeviation={blur / 2} result="blur" />
                        </filter>
                    </defs>
                    <path
                        d={pathData}
                        fill={layer.params.color || '#3b82f6'}
                        fillOpacity={opacity}
                        filter={`url(#${filterId})`}
                        style={{ mixBlendMode: blendMode as any }}
                    />
                </g>
            );
        }

        case 'gradient': {
            const gradId = genDefId('grad');
            const stops = layer.params.stops || [
                { offset: 0, color: '#667eea' },
                { offset: 1, color: '#764ba2' }
            ];
            const angle = layer.params.angle || 180;
            // Convert angle to x1,y1,x2,y2
            const rad = (angle - 90) * Math.PI / 180;
            const x1 = 50 + 50 * Math.cos(rad + Math.PI);
            const y1 = 50 + 50 * Math.sin(rad + Math.PI);
            const x2 = 50 + 50 * Math.cos(rad);
            const y2 = 50 + 50 * Math.sin(rad);

            return (
                <g key={key}>
                    <defs>
                        <linearGradient
                            id={gradId}
                            x1={`${x1}%`} y1={`${y1}%`}
                            x2={`${x2}%`} y2={`${y2}%`}
                        >
                            {stops.map((stop: any, i: number) => (
                                <stop
                                    key={i}
                                    offset={`${stop.offset * 100}%`}
                                    stopColor={stop.color}
                                />
                            ))}
                        </linearGradient>
                    </defs>
                    <path
                        d={pathData}
                        fill={`url(#${gradId})`}
                        fillOpacity={opacity}
                        fillRule="evenodd"
                        style={{ mixBlendMode: blendMode as any }}
                    />
                </g>
            );
        }

        case 'noise': {
            // SVG noise filter using feTurbulence
            const filterId = genDefId('noise');
            const scale = layer.params.scale || 1;
            const intensity = layer.params.intensity || 0.3;
            return (
                <g key={key}>
                    <defs>
                        <filter id={filterId} x="0" y="0" width="100%" height="100%">
                            <feTurbulence
                                type="fractalNoise"
                                baseFrequency={0.02 * scale}
                                numOctaves={4}
                                result="noise"
                                stitchTiles="stitch"
                            />
                            <feColorMatrix type="saturate" values="0" />
                            <feComponentTransfer>
                                <feFuncA type="linear" slope={intensity * 2} />
                            </feComponentTransfer>
                            <feComposite in2="SourceGraphic" operator="in" />
                        </filter>
                    </defs>
                    <path
                        d={pathData}
                        fill="white"
                        fillOpacity={opacity}
                        filter={`url(#${filterId})`}
                        style={{ mixBlendMode: blendMode as any }}
                        fillRule="evenodd"
                    />
                </g>
            );
        }

        case 'pattern': {
            // Render pattern elements along the edge or fill
            // This is complex - for now, render a simple pattern mask
            const patternId = genDefId('pattern');
            const patternType = layer.params.patternType || 'dots';
            const spacing = layer.params.spacing || 20;
            const size = layer.params.size || 4;

            let patternContent: React.ReactNode;
            switch (patternType) {
                case 'dots':
                    patternContent = (
                        <circle cx={spacing / 2} cy={spacing / 2} r={size / 2} fill="currentColor" />
                    );
                    break;
                case 'lines':
                    patternContent = (
                        <line x1={0} y1={spacing / 2} x2={spacing} y2={spacing / 2}
                            stroke="currentColor" strokeWidth={size / 2} />
                    );
                    break;
                case 'ticks':
                    patternContent = (
                        <rect x={spacing / 2 - size / 4} y={2} width={size / 2} height={spacing - 4}
                            fill="currentColor" />
                    );
                    break;
                default:
                    patternContent = (
                        <circle cx={spacing / 2} cy={spacing / 2} r={size / 2} fill="currentColor" />
                    );
            }

            return (
                <g key={key}>
                    <defs>
                        <pattern
                            id={patternId}
                            patternUnits="userSpaceOnUse"
                            width={spacing}
                            height={spacing}
                        >
                            <g style={{ color: layer.params.color || '#000000' }}>
                                {patternContent}
                            </g>
                        </pattern>
                        <clipPath id={`clip-${patternId}`}>
                            <path d={pathData} fillRule="evenodd" />
                        </clipPath>
                    </defs>
                    <g clipPath={`url(#clip-${patternId})`}>
                        <rect
                            x="-100" y="-100"
                            width="2000" height="2000"
                            fill={`url(#${patternId})`}
                            fillOpacity={opacity}
                            style={{ mixBlendMode: blendMode as any }}
                        />
                    </g>
                </g>
            );
        }

        default:
            return null;
    }
}

export const Canvas: React.FC = () => {
    const stack = useProjectStore(s => s.stack);
    const layers = useLayersStore(s => s.layers);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [fillRule, setFillRule] = useState<'evenodd' | 'nonzero'>('evenodd');
    const lastMouse = useRef({ x: 0, y: 0 });
    const svgRef = useRef<SVGSVGElement>(null);

    // Re-evaluate geometry when stack changes
    const svgPath = useMemo(() => {
        try {
            return evaluateStack(stack);
        } catch (e) {
            console.error(e);
            return '';
        }
    }, [stack]);

    // Pan handling
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            setIsPanning(true);
            lastMouse.current = { x: e.clientX, y: e.clientY };
            e.preventDefault();
        }
    };

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            if (!isPanning) return;
            const dx = e.clientX - lastMouse.current.x;
            const dy = e.clientY - lastMouse.current.y;
            setPan(p => ({ x: p.x + dx, y: p.y + dy }));
            lastMouse.current = { x: e.clientX, y: e.clientY };
        };
        const handleUp = () => setIsPanning(false);

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [isPanning]);

    // Wheel zoom
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const factor = e.deltaY > 0 ? 0.9 : 1.1;
            setZoom(z => Math.min(5, Math.max(0.1, z * factor)));
        }
    };

    return (
        <div
            className="canvas-wrapper"
            style={{ width: '100%', height: '100%', cursor: isPanning ? 'grabbing' : 'default' }}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
        >
            {/* Toolbar */}
            <div className="canvas-toolbar">
                <div className="toolbar-group">
                    <button onClick={() => setZoom(z => z * 1.15)} title="Zoom In">+</button>
                    <span className="zoom-label">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => z / 1.15)} title="Zoom Out">-</button>
                    <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} title="Reset View">⌂</button>
                </div>
                <div className="toolbar-group">
                    <label className="fill-rule-toggle">
                        <span>Fill Rule:</span>
                        <select value={fillRule} onChange={e => setFillRule(e.target.value as any)}>
                            <option value="evenodd">Even-Odd</option>
                            <option value="nonzero">Non-Zero</option>
                        </select>
                    </label>
                </div>
            </div>

            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox="0 0 1000 800"
                style={{ background: '#fafbfc' }}
            >
                <defs>
                    <pattern id="grid-major" width="80" height="80" patternUnits="userSpaceOnUse">
                        <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                    </pattern>
                    <pattern id="grid-minor" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-minor)" />
                <rect width="100%" height="100%" fill="url(#grid-major)" />

                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                    {/* Render layers in order (bottom to top) */}
                    {layers.map((layer, idx) => renderLayer(layer, svgPath, idx))}

                    {/* Handles Overlay */}
                    <HandlesOverlay zoom={zoom} pan={pan} />
                </g>
            </svg>

            <style>{`
                .canvas-wrapper {
                    position: relative;
                    user-select: none;
                }
                .canvas-toolbar {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    z-index: 10;
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }
                .toolbar-group {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: white;
                    padding: 4px;
                    border-radius: 6px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    border: 1px solid var(--line);
                }
                .toolbar-group button {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    background: transparent;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                }
                .toolbar-group button:hover {
                    background: var(--bg);
                }
                .zoom-label {
                    font-size: 11px;
                    min-width: 40px;
                    text-align: center;
                    color: var(--text-muted);
                }
                .fill-rule-toggle {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    color: var(--text-muted);
                }
                .fill-rule-toggle select {
                    padding: 4px 6px;
                    border: 1px solid var(--line);
                    border-radius: 4px;
                    font-size: 11px;
                    background: white;
                }
            `}</style>
        </div>
    );
};
