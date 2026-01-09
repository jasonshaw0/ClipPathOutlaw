import React, { useState } from 'react';
import {
    useLayersStore,
    type StyleLayer,
    type LayerType,
    type BlendMode,
    LAYER_PRESETS
} from '../../store/layers';
import {
    Layers,
    Eye,
    EyeOff,
    Plus,
    Copy,
    Trash2,
    ChevronDown,
    Palette,
    Droplet,
    Sun,
    Circle,
    Sparkles,
    Grid3X3
} from 'lucide-react';

const LAYER_ICONS: Record<LayerType, React.ElementType> = {
    'fill': Palette,
    'stroke': Circle,
    'inset-border': Circle,
    'inner-glow': Sun,
    'outer-glow': Sun,
    'specular': Sparkles,
    'shadow': Droplet,
    'noise': Grid3X3,
    'pattern': Grid3X3,
    'gradient': Palette
};

const BLEND_MODES: BlendMode[] = [
    'normal', 'multiply', 'screen', 'overlay', 'soft-light',
    'hard-light', 'color-dodge', 'color-burn', 'difference', 'exclusion'
];

const LAYER_TYPES: { type: LayerType; label: string }[] = [
    { type: 'fill', label: 'Fill' },
    { type: 'gradient', label: 'Gradient' },
    { type: 'stroke', label: 'Stroke' },
    { type: 'inset-border', label: 'Inset Border' },
    { type: 'inner-glow', label: 'Inner Glow' },
    { type: 'outer-glow', label: 'Outer Glow' },
    { type: 'shadow', label: 'Shadow' },
    { type: 'noise', label: 'Noise' },
    { type: 'pattern', label: 'Pattern' },
];

export const LayersPanel: React.FC = () => {
    const {
        layers,
        selectedLayerId,
        addLayer,
        removeLayer,
        updateLayer,
        selectLayer,
        toggleLayerVisibility,
        duplicateLayer,
        resetLayers
    } = useLayersStore();

    const [showPresets, setShowPresets] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const selectedLayer = layers.find(l => l.id === selectedLayerId);

    const handleApplyPreset = (presetName: string) => {
        const preset = LAYER_PRESETS[presetName];
        if (preset) {
            // Clear and set to preset
            resetLayers();
            preset.forEach(l => addLayer(l));
        }
        setShowPresets(false);
    };

    const handleAddLayer = (type: LayerType) => {
        const defaults: Record<LayerType, Omit<StyleLayer, 'id'>> = {
            'fill': { type: 'fill', name: 'New Fill', visible: true, locked: false, opacity: 1, blendMode: 'normal', offset: 0, params: { color: '#3b82f6' } },
            'stroke': { type: 'stroke', name: 'New Stroke', visible: true, locked: false, opacity: 1, blendMode: 'normal', offset: 0, params: { color: '#1d4ed8', width: 2 } },
            'inset-border': { type: 'inset-border', name: 'Inset Border', visible: true, locked: false, opacity: 1, blendMode: 'normal', offset: -3, params: { color: '#e2e8f0', width: 1 } },
            'inner-glow': { type: 'inner-glow', name: 'Inner Glow', visible: true, locked: false, opacity: 0.5, blendMode: 'screen', offset: -4, params: { color: '#ffffff', blur: 8 } },
            'outer-glow': { type: 'outer-glow', name: 'Outer Glow', visible: true, locked: false, opacity: 0.5, blendMode: 'screen', offset: 4, params: { color: '#3b82f6', blur: 12 } },
            'specular': { type: 'specular', name: 'Specular', visible: true, locked: false, opacity: 0.6, blendMode: 'screen', offset: 0, params: { color: '#ffffff', angle: 135, size: 50 } },
            'shadow': { type: 'shadow', name: 'Shadow', visible: true, locked: false, opacity: 0.25, blendMode: 'multiply', offset: 0, params: { color: '#000000', blur: 16, x: 0, y: 8 } },
            'noise': { type: 'noise', name: 'Noise', visible: true, locked: false, opacity: 0.1, blendMode: 'overlay', offset: 0, params: { intensity: 0.3, scale: 1 } },
            'pattern': { type: 'pattern', name: 'Pattern', visible: true, locked: false, opacity: 0.6, blendMode: 'normal', offset: 0, params: { patternType: 'dots', spacing: 20, size: 4 } },
            'gradient': { type: 'gradient', name: 'Gradient', visible: true, locked: false, opacity: 1, blendMode: 'normal', offset: 0, params: { type: 'linear', angle: 180, stops: [{ offset: 0, color: '#667eea' }, { offset: 1, color: '#764ba2' }] } },
        };
        addLayer(defaults[type]);
        setShowAddMenu(false);
    };

    return (
        <div className="layers-panel">
            {/* Header */}
            <div className="layers-header">
                <div className="layers-title">
                    <Layers size={14} />
                    <span>Style Layers</span>
                </div>
                <div className="layers-actions">
                    <div className="dropdown-wrapper">
                        <button onClick={() => setShowPresets(!showPresets)} className="btn-preset">
                            <Sparkles size={12} />
                            Presets
                            <ChevronDown size={12} />
                        </button>
                        {showPresets && (
                            <div className="dropdown-menu">
                                {Object.keys(LAYER_PRESETS).map(name => (
                                    <button key={name} onClick={() => handleApplyPreset(name)}>
                                        {name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="dropdown-wrapper">
                        <button onClick={() => setShowAddMenu(!showAddMenu)} title="Add Layer">
                            <Plus size={14} />
                        </button>
                        {showAddMenu && (
                            <div className="dropdown-menu">
                                {LAYER_TYPES.map(({ type, label }) => (
                                    <button key={type} onClick={() => handleAddLayer(type)}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Layer List */}
            <div className="layers-list">
                {layers.length === 0 && (
                    <div className="empty">No layers. Add one or pick a preset!</div>
                )}
                {layers.map((layer) => {
                    const Icon = LAYER_ICONS[layer.type] || Layers;
                    return (
                        <div
                            key={layer.id}
                            className={`layer-item ${selectedLayerId === layer.id ? 'selected' : ''}`}
                            onClick={() => selectLayer(layer.id)}
                        >
                            <button
                                className="vis-btn"
                                onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                            >
                                {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                            </button>
                            <Icon size={14} className="layer-icon" />
                            <span className="layer-name">{layer.name}</span>
                            <span className="layer-opacity">{Math.round(layer.opacity * 100)}%</span>
                            <button
                                className="action-btn"
                                onClick={(e) => { e.stopPropagation(); duplicateLayer(layer.id); }}
                                title="Duplicate"
                            >
                                <Copy size={12} />
                            </button>
                            <button
                                className="action-btn danger"
                                onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
                                title="Delete"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Layer Inspector */}
            {selectedLayer && (
                <div className="layer-inspector">
                    <div className="inspector-header">
                        <input
                            className="name-input"
                            value={selectedLayer.name}
                            onChange={(e) => updateLayer(selectedLayer.id, { name: e.target.value })}
                        />
                        <span className="type-badge">{selectedLayer.type}</span>
                    </div>

                    <div className="inspector-fields">
                        {/* Opacity */}
                        <div className="field-row">
                            <label>Opacity</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={selectedLayer.opacity * 100}
                                onChange={(e) => updateLayer(selectedLayer.id, { opacity: parseFloat(e.target.value) / 100 })}
                            />
                            <span className="field-value">{Math.round(selectedLayer.opacity * 100)}%</span>
                        </div>

                        {/* Blend Mode */}
                        <div className="field-row">
                            <label>Blend</label>
                            <select
                                value={selectedLayer.blendMode}
                                onChange={(e) => updateLayer(selectedLayer.id, { blendMode: e.target.value as BlendMode })}
                            >
                                {BLEND_MODES.map(bm => (
                                    <option key={bm} value={bm}>{bm}</option>
                                ))}
                            </select>
                        </div>

                        {/* Offset */}
                        {['inset-border', 'inner-glow', 'outer-glow', 'stroke'].includes(selectedLayer.type) && (
                            <div className="field-row">
                                <label>Offset</label>
                                <input
                                    type="number"
                                    value={selectedLayer.offset}
                                    onChange={(e) => updateLayer(selectedLayer.id, { offset: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        )}

                        {/* Color (for fill, stroke, etc.) */}
                        {selectedLayer.params.color !== undefined && (
                            <div className="field-row">
                                <label>Color</label>
                                <input
                                    type="color"
                                    value={selectedLayer.params.color}
                                    onChange={(e) => updateLayer(selectedLayer.id, {
                                        params: { ...selectedLayer.params, color: e.target.value }
                                    })}
                                />
                                <input
                                    type="text"
                                    className="color-text"
                                    value={selectedLayer.params.color}
                                    onChange={(e) => updateLayer(selectedLayer.id, {
                                        params: { ...selectedLayer.params, color: e.target.value }
                                    })}
                                />
                            </div>
                        )}

                        {/* Width (stroke) */}
                        {selectedLayer.params.width !== undefined && (
                            <div className="field-row">
                                <label>Width</label>
                                <input
                                    type="number"
                                    value={selectedLayer.params.width}
                                    min="0"
                                    step="0.5"
                                    onChange={(e) => updateLayer(selectedLayer.id, {
                                        params: { ...selectedLayer.params, width: parseFloat(e.target.value) || 0 }
                                    })}
                                />
                            </div>
                        )}

                        {/* Blur (shadow, glow) */}
                        {selectedLayer.params.blur !== undefined && (
                            <div className="field-row">
                                <label>Blur</label>
                                <input
                                    type="number"
                                    value={selectedLayer.params.blur}
                                    min="0"
                                    onChange={(e) => updateLayer(selectedLayer.id, {
                                        params: { ...selectedLayer.params, blur: parseFloat(e.target.value) || 0 }
                                    })}
                                />
                            </div>
                        )}

                        {/* Shadow X/Y */}
                        {selectedLayer.type === 'shadow' && (
                            <>
                                <div className="field-row">
                                    <label>X Offset</label>
                                    <input
                                        type="number"
                                        value={selectedLayer.params.x || 0}
                                        onChange={(e) => updateLayer(selectedLayer.id, {
                                            params: { ...selectedLayer.params, x: parseFloat(e.target.value) || 0 }
                                        })}
                                    />
                                </div>
                                <div className="field-row">
                                    <label>Y Offset</label>
                                    <input
                                        type="number"
                                        value={selectedLayer.params.y || 0}
                                        onChange={(e) => updateLayer(selectedLayer.id, {
                                            params: { ...selectedLayer.params, y: parseFloat(e.target.value) || 0 }
                                        })}
                                    />
                                </div>
                            </>
                        )}

                        {/* Pattern params */}
                        {selectedLayer.type === 'pattern' && (
                            <>
                                <div className="field-row">
                                    <label>Type</label>
                                    <select
                                        value={selectedLayer.params.patternType}
                                        onChange={(e) => updateLayer(selectedLayer.id, {
                                            params: { ...selectedLayer.params, patternType: e.target.value }
                                        })}
                                    >
                                        <option value="dots">Dots</option>
                                        <option value="ticks">Ticks</option>
                                        <option value="rivets">Rivets</option>
                                        <option value="perforations">Perforations</option>
                                        <option value="vents">Vents</option>
                                        <option value="lines">Lines</option>
                                    </select>
                                </div>
                                <div className="field-row">
                                    <label>Spacing</label>
                                    <input
                                        type="number"
                                        value={selectedLayer.params.spacing}
                                        min="1"
                                        onChange={(e) => updateLayer(selectedLayer.id, {
                                            params: { ...selectedLayer.params, spacing: parseFloat(e.target.value) || 10 }
                                        })}
                                    />
                                </div>
                                <div className="field-row">
                                    <label>Size</label>
                                    <input
                                        type="number"
                                        value={selectedLayer.params.size}
                                        min="1"
                                        onChange={(e) => updateLayer(selectedLayer.id, {
                                            params: { ...selectedLayer.params, size: parseFloat(e.target.value) || 4 }
                                        })}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .layers-panel {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: var(--panel);
                }
                .layers-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px;
                    border-bottom: 1px solid var(--line);
                }
                .layers-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .layers-actions {
                    display: flex;
                    gap: 4px;
                }
                .layers-actions button {
                    padding: 4px 8px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: transparent;
                    border: 1px solid var(--line);
                    border-radius: 4px;
                    font-size: 11px;
                    cursor: pointer;
                }
                .layers-actions button:hover {
                    background: var(--bg);
                }
                .btn-preset {
                    background: var(--accent-bg) !important;
                    color: var(--accent);
                    border-color: var(--accent) !important;
                }
                .dropdown-wrapper {
                    position: relative;
                }
                .dropdown-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 4px;
                    min-width: 150px;
                    background: var(--panel);
                    border: 1px solid var(--line);
                    border-radius: 6px;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                    z-index: 100;
                    overflow: hidden;
                }
                .dropdown-menu button {
                    display: block;
                    width: 100%;
                    padding: 8px 12px;
                    text-align: left;
                    border: none;
                    border-radius: 0;
                    font-size: 12px;
                }
                .dropdown-menu button:hover {
                    background: var(--accent-bg);
                    color: var(--accent);
                }
                
                .layers-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px;
                }
                .empty {
                    padding: 20px;
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 12px;
                }
                .layer-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px;
                    margin-bottom: 4px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                }
                .layer-item:hover {
                    background: var(--bg);
                }
                .layer-item.selected {
                    background: var(--accent-bg);
                    color: var(--accent);
                }
                .vis-btn, .action-btn {
                    padding: 2px;
                    background: transparent;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    opacity: 0.5;
                }
                .vis-btn:hover, .action-btn:hover {
                    opacity: 1;
                    background: var(--bg);
                }
                .action-btn.danger:hover {
                    color: var(--danger);
                }
                .layer-icon {
                    opacity: 0.6;
                }
                .layer-name {
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .layer-opacity {
                    font-size: 10px;
                    color: var(--text-muted);
                    min-width: 32px;
                    text-align: right;
                }

                .layer-inspector {
                    border-top: 1px solid var(--line);
                    padding: 12px;
                    background: var(--bg);
                    max-height: 300px;
                    overflow-y: auto;
                }
                .inspector-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 12px;
                }
                .name-input {
                    flex: 1;
                    font-size: 13px;
                    font-weight: 500;
                    border: none;
                    background: transparent;
                    outline: none;
                }
                .name-input:focus {
                    background: var(--panel);
                    padding: 4px;
                    margin: -4px;
                    border-radius: 4px;
                }
                .type-badge {
                    font-size: 9px;
                    text-transform: uppercase;
                    padding: 2px 6px;
                    background: var(--panel);
                    border-radius: 4px;
                    color: var(--text-muted);
                }
                .inspector-fields {
                }
                .field-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                    font-size: 11px;
                }
                .field-row label {
                    min-width: 60px;
                    color: var(--text-muted);
                }
                .field-row input[type="range"] {
                    flex: 1;
                }
                .field-row input[type="number"],
                .field-row input[type="text"] {
                    width: 60px;
                    padding: 4px 6px;
                    border: 1px solid var(--line);
                    border-radius: 4px;
                    font-size: 11px;
                    font-family: var(--font-mono);
                }
                .field-row input[type="color"] {
                    width: 24px;
                    height: 24px;
                    border: 1px solid var(--line);
                    border-radius: 4px;
                    padding: 0;
                    cursor: pointer;
                }
                .field-row .color-text {
                    flex: 1;
                }
                .field-row select {
                    flex: 1;
                    padding: 4px 6px;
                    border: 1px solid var(--line);
                    border-radius: 4px;
                    font-size: 11px;
                    background: var(--panel);
                }
                .field-value {
                    min-width: 36px;
                    text-align: right;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );
};
