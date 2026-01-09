import React from 'react';
import { useProjectStore } from '../../store/project';
import { Minus, Plus } from 'lucide-react';

export const Inspector: React.FC = () => {
    const { stack, selection, updateNode, strokeSettings, setStrokeSettings } = useProjectStore();
    const selectedNode = stack.find(n => n.id === selection);

    if (!selectedNode) {
        return (
            <div className="inspector">
                <div className="header">
                    <h3>Global Settings</h3>
                </div>
                <div className="content">
                    <div className="field">
                        <label>Simplification Tolerance</label>
                        <div className="numeric-input">
                            <input
                                type="range"
                                min="0.1"
                                max="10"
                                step="0.1"
                                value={strokeSettings.simplifyTolerance}
                                onChange={e => setStrokeSettings({ simplifyTolerance: parseFloat(e.target.value) })}
                            />
                            <span className="slider-value">{strokeSettings.simplifyTolerance}</span>
                        </div>
                    </div>
                    <div className="field">
                        <label>Smoothing Iterations</label>
                        <div className="numeric-input">
                            <button
                                onClick={() => setStrokeSettings({ smoothIterations: Math.max(0, strokeSettings.smoothIterations - 1) })}
                            >
                                <Minus size={12} />
                            </button>
                            <span className="slider-value" style={{ flex: 1, textAlign: 'center' }}>
                                {strokeSettings.smoothIterations}
                            </span>
                            <button
                                onClick={() => setStrokeSettings({ smoothIterations: Math.min(5, strokeSettings.smoothIterations + 1) })}
                            >
                                <Plus size={12} />
                            </button>
                        </div>
                    </div>
                </div>
                <style>{`
                    .inspector { padding: 12px; overflow-y: auto; }
                    .header { margin-bottom: 16px; border-bottom: 1px solid var(--line); padding-bottom: 8px; }
                    .header h3 { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; }
                    .content { display: flex; flex-direction: column; gap: 12px; }
                    .field label { display: block; font-size: 10px; color: var(--text-muted); margin-bottom: 4px; }
                    .numeric-input { display: flex; align-items: center; gap: 8px; }
                    .numeric-input input[type="range"] { flex: 1; }
                    .numeric-input button { 
                        width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
                        background: var(--bg); border: 1px solid var(--line); border-radius: 4px; cursor: pointer;
                    }
                    .slider-value { font-size: 11px; font-family: var(--font-mono); min-width: 24px; text-align: right; }
                 `}</style>
            </div>
        );
    }

    const handleChange = (key: string, value: any) => {
        updateNode(selectedNode.id, {
            params: { ...selectedNode.params, [key]: value }
        });
    };

    const handleNumericChange = (key: string, value: string) => {
        const num = parseFloat(value);
        if (!isNaN(num)) {
            handleChange(key, num);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateNode(selectedNode.id, { name: e.target.value });
    };

    const increment = (key: string, step: number = 1) => {
        const current = selectedNode.params[key] || 0;
        handleChange(key, current + step);
    };

    const decrement = (key: string, step: number = 1, min: number = 0) => {
        const current = selectedNode.params[key] || 0;
        handleChange(key, Math.max(min, current - step));
    };

    // Get field config based on node type
    const getFieldConfig = (key: string) => {
        const configs: Record<string, { label?: string; min?: number; max?: number; step?: number; type?: string }> = {
            sides: { label: 'Sides', min: 3, max: 12, step: 1 },
            points: { label: 'Points', min: 3, max: 20, step: 1 },
            innerRadius: { label: 'Inner Radius', min: 1, step: 5 },
            x: { label: 'X Position', step: 10 },
            y: { label: 'Y Position', step: 10 },
            width: { label: 'Width', min: 1, step: 10 },
            height: { label: 'Height', min: 1, step: 10 },
            radius: { label: 'Radius', min: 0, step: 5 },
            shapeType: { label: 'Shape Type', type: 'select' },
            pathData: { label: 'Path Data', type: 'textarea' },
        };
        return configs[key] || { label: key, step: 1 };
    };

    const renderField = (key: string, val: any) => {
        const config = getFieldConfig(key);
        const label = config.label || key;

        if (config.type === 'textarea') {
            return (
                <div key={key} className="field">
                    <label>{label}</label>
                    <textarea
                        value={val || ''}
                        onChange={e => handleChange(key, e.target.value)}
                        rows={4}
                        placeholder="M0,0 L100,100..."
                    />
                </div>
            );
        }

        if (config.type === 'select') {
            return (
                <div key={key} className="field">
                    <label>{label}</label>
                    <select value={val} onChange={e => handleChange(key, e.target.value)}>
                        <option value="circle">Circle</option>
                        <option value="rect">Rectangle</option>
                        <option value="polygon">Polygon</option>
                        <option value="star">Star</option>
                    </select>
                </div>
            );
        }

        if (typeof val === 'number') {
            const step = config.step || 1;
            const min = config.min ?? 0;
            const isSlider = config.min !== undefined && config.max !== undefined;

            return (
                <div key={key} className="field">
                    <label>{label}</label>
                    <div className="numeric-input">
                        <button onClick={() => decrement(key, step, min)} title="Decrease">
                            <Minus size={12} />
                        </button>
                        {isSlider ? (
                            <>
                                <input
                                    type="range"
                                    min={config.min}
                                    max={config.max}
                                    value={val}
                                    onChange={e => handleNumericChange(key, e.target.value)}
                                />
                                <span className="slider-value">{val}</span>
                            </>
                        ) : (
                            <input
                                type="number"
                                value={val}
                                min={min}
                                step={step}
                                onChange={e => handleNumericChange(key, e.target.value)}
                            />
                        )}
                        <button onClick={() => increment(key, step)} title="Increase">
                            <Plus size={12} />
                        </button>
                    </div>
                </div>
            );
        }

        if (typeof val === 'string') {
            return (
                <div key={key} className="field">
                    <label>{label}</label>
                    <input
                        type="text"
                        value={val}
                        onChange={e => handleChange(key, e.target.value)}
                    />
                </div>
            );
        }

        return null;
    };

    // Order params for better UX
    const orderedKeys = ['x', 'y', 'width', 'height', 'radius', 'sides', 'points', 'innerRadius', 'shapeType', 'pathData'];
    const sortedParams = Object.entries(selectedNode.params).sort(([a], [b]) => {
        const idxA = orderedKeys.indexOf(a);
        const idxB = orderedKeys.indexOf(b);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
    });

    return (
        <div className="inspector">
            <div className="header">
                <input
                    className="name-input"
                    value={selectedNode.name}
                    onChange={handleNameChange}
                />
                <span className="type-badge">
                    {selectedNode.type.replace('shape_', '').replace('op_', '').replace('mod_', '')}
                </span>
            </div>

            <div className="content">
                {sortedParams.map(([key, val]) => renderField(key, val))}
            </div>

            <style>{`
                .inspector { padding: 12px; overflow-y: auto; }
                .inspector-empty { padding: 20px; color: var(--text-muted); text-align: center; }
                .header { margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
                .name-input { 
                    font-weight: 600; 
                    border: none; 
                    background: transparent; 
                    font-size: 14px; 
                    flex: 1;
                    outline: none; 
                }
                .name-input:focus { background: var(--bg); padding: 4px; margin: -4px; border-radius: 4px; }
                .type-badge { 
                    font-size: 9px; 
                    background: var(--bg); 
                    padding: 2px 6px; 
                    border-radius: 4px; 
                    color: var(--text-muted); 
                    text-transform: uppercase;
                    white-space: nowrap;
                }
                
                .content { display: flex; flex-direction: column; gap: 12px; }
                .field { }
                .field label { 
                    display: block; 
                    font-size: 10px; 
                    color: var(--text-muted); 
                    margin-bottom: 4px; 
                    text-transform: capitalize; 
                }
                .field input[type="text"],
                .field input[type="number"],
                .field select { 
                    width: 100%; 
                    padding: 6px 8px; 
                    border: 1px solid var(--line); 
                    border-radius: 4px; 
                    font-size: 11px; 
                    font-family: var(--font-mono);
                    background: var(--panel);
                }
                .field textarea {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid var(--line);
                    border-radius: 4px;
                    font-size: 10px;
                    font-family: var(--font-mono);
                    resize: vertical;
                    min-height: 60px;
                }
                .field select {
                    cursor: pointer;
                }

                .numeric-input {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .numeric-input button {
                    width: 24px;
                    height: 24px;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg);
                    border: 1px solid var(--line);
                    border-radius: 4px;
                    cursor: pointer;
                    flex-shrink: 0;
                }
                .numeric-input button:hover {
                    background: var(--accent-bg);
                    border-color: var(--accent);
                    color: var(--accent);
                }
                .numeric-input input[type="number"] {
                    flex: 1;
                    text-align: center;
                }
                .numeric-input input[type="range"] {
                    flex: 1;
                }
                .slider-value {
                    min-width: 24px;
                    text-align: center;
                    font-size: 11px;
                    font-family: var(--font-mono);
                }
            `}</style>
        </div>
    );
};
