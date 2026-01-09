import React, { useState } from 'react';
import { useProjectStore } from '../../store/project';
import { Layers, Square, Circle, Scissors, Component, Trash2, Sparkles, Download, Hexagon, Star, Combine, ToggleLeft, Bot } from 'lucide-react';
import { PresetsPanel } from './PresetsPanel';
import { ExportPanel } from './ExportPanel';
import { AISettingsPanel } from './AISettingsPanel';

const IconMap: Record<string, React.ElementType> = {
    shape_rect: Square,
    shape_circle: Circle,
    shape_polygon: Hexagon,
    shape_star: Star,
    op_subtract: Scissors,
    op_union: Component,
    op_intersect: Combine,
    op_xor: ToggleLeft,
    default: Layers
};

type TabId = 'stack' | 'presets' | 'export' | 'ai';

export const Sidebar: React.FC = () => {
    const { stack, selection, setSelection, addNode, removeNode } = useProjectStore();
    const [activeTab, setActiveTab] = useState<TabId>('stack');

    const handleAdd = (type: any) => {
        const defaults: Record<string, Record<string, any>> = {
            shape_rect: { x: 100, y: 100, width: 200, height: 160, radius: 16 },
            shape_circle: { x: 300, y: 250, radius: 80 },
            shape_polygon: { x: 300, y: 250, radius: 100, sides: 6 },
            shape_star: { x: 300, y: 250, radius: 100, points: 5, innerRadius: 40 },
            op_subtract: { shapeType: 'circle', x: 200, y: 200, radius: 50 },
            op_union: { shapeType: 'circle', x: 350, y: 350, radius: 50 },
            op_intersect: { shapeType: 'rect', x: 150, y: 150, width: 150, height: 150 },
            op_xor: { shapeType: 'circle', x: 250, y: 250, radius: 60 },
        };
        const names: Record<string, string> = {
            shape_rect: 'Rectangle',
            shape_circle: 'Circle',
            shape_polygon: 'Polygon',
            shape_star: 'Star',
            op_subtract: 'Subtract',
            op_union: 'Union',
            op_intersect: 'Intersect',
            op_xor: 'XOR',
        };
        addNode({
            id: Math.random().toString(36).slice(2),
            type,
            name: names[type] || 'Shape',
            visible: true,
            locked: false,
            params: defaults[type] || { x: 100, y: 100, width: 100, height: 100, radius: 12 }
        });
    };

    const handleDelete = () => {
        if (selection) {
            removeNode(selection);
            setSelection(null);
        }
    };

    const handleClearAll = () => {
        stack.forEach(node => removeNode(node.id));
        setSelection(null);
    };

    return (
        <div className="sidebar">
            {/* Tabs */}
            <div className="tabs-bar">
                <button
                    className={`tab ${activeTab === 'stack' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stack')}
                    title="Shape Stack"
                >
                    <Layers size={14} />
                    <span>Stack</span>
                </button>
                <button
                    className={`tab ${activeTab === 'presets' ? 'active' : ''}`}
                    onClick={() => setActiveTab('presets')}
                    title="Presets Library"
                >
                    <Sparkles size={14} />
                    <span>Presets</span>
                </button>
                <button
                    className={`tab ${activeTab === 'export' ? 'active' : ''}`}
                    onClick={() => setActiveTab('export')}
                    title="Export Options"
                >
                    <Download size={14} />
                    <span>Export</span>
                </button>
                <button
                    className={`tab ${activeTab === 'ai' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ai')}
                    title="AI Settings"
                >
                    <Bot size={14} />
                    <span>AI</span>
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'stack' && (
                    <>
                        <div className="header">
                            <div className="actions">
                                <button onClick={() => handleAdd('shape_rect')} title="Rectangle"><Square size={14} /></button>
                                <button onClick={() => handleAdd('shape_circle')} title="Circle"><Circle size={14} /></button>
                                <button onClick={() => handleAdd('shape_polygon')} title="Polygon"><Hexagon size={14} /></button>
                                <button onClick={() => handleAdd('shape_star')} title="Star"><Star size={14} /></button>
                            </div>
                            <div className="actions">
                                <button onClick={() => handleAdd('op_subtract')} title="Subtract"><Scissors size={14} /></button>
                                <button onClick={() => handleAdd('op_union')} title="Union"><Component size={14} /></button>
                                <button onClick={() => handleAdd('op_intersect')} title="Intersect"><Combine size={14} /></button>
                                <button onClick={() => handleAdd('op_xor')} title="XOR"><ToggleLeft size={14} /></button>
                            </div>
                            <div className="actions">
                                <button onClick={handleDelete} title="Delete" disabled={!selection}><Trash2 size={14} /></button>
                                <button onClick={handleClearAll} title="Clear" className="danger">Clear</button>
                            </div>
                            <div className="actions" style={{ marginLeft: 'auto' }}>
                                <button
                                    onClick={() => useProjectStore.getState().aiBakeStrokes()}
                                    title="AI Recognize & Bake"
                                    className="ai-bake-btn"
                                    disabled={useProjectStore.getState().aiLoading}
                                >
                                    <Bot size={14} /> {useProjectStore.getState().aiLoading ? 'AI...' : 'AI Bake'}
                                </button>
                            </div>
                        </div>

                        <div className="list">
                            {stack.length === 0 && <div className="empty">No shapes yet. Add one or pick a preset!</div>}
                            {stack.map(node => {
                                const Icon = IconMap[node.type] || IconMap.default;
                                return (
                                    <div
                                        key={node.id}
                                        className={`item ${selection === node.id ? 'selected' : ''}`}
                                        onClick={() => setSelection(node.id)}
                                    >
                                        <Icon size={16} className="icon" />
                                        <span className="name">{node.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {activeTab === 'presets' && <PresetsPanel />}
                {activeTab === 'export' && <ExportPanel />}
                {activeTab === 'ai' && <AISettingsPanel />}
            </div>

            <style>{`
        .sidebar { height: 100%; display: flex; flex-direction: column; background: var(--panel); overflow: hidden; }
        
        .tabs-bar { 
          display: flex; 
          border-bottom: 1px solid var(--line); 
          padding: 0;
          background: var(--bg);
        }
        .tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 10px 6px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .tab span { display: none; }
        @media (min-width: 400px) {
          .tab span { display: inline; }
        }
        .tab:hover { background: var(--panel); color: var(--text); }
        .tab.active { 
          color: var(--accent); 
          border-bottom-color: var(--accent);
          background: var(--panel);
        }

        .tab-content { flex: 1; overflow-y: auto; overflow-x: hidden; min-height: 0; }

        .header { 
          padding: 10px; 
          border-bottom: 1px solid var(--line); 
          display: flex; 
          flex-wrap: wrap;
          align-items: center; 
          gap: 6px;
        }
        .actions { display: flex; gap: 3px; }
        .actions button { 
          padding: 6px; 
          background: transparent; 
          border: 1px solid var(--line); 
          border-radius: 6px; 
          cursor: pointer; 
          display: flex;
          align-items: center;
          font-size: 11px;
          gap: 4px;
          color: var(--text);
          transition: all 0.15s ease;
        }
        .actions button:hover { background: var(--bg); border-color: var(--line-strong); }
        .actions button:disabled { opacity: 0.4; cursor: not-allowed; }
        .actions button.danger { color: var(--danger); border-color: var(--danger); }
        .actions button.danger:hover { background: var(--danger-bg); }
        .actions .ai-bake-btn {
          color: var(--accent);
          border-color: var(--accent);
          font-weight: 500;
        }
        .actions .ai-bake-btn:hover {
          background: var(--accent-bg);
        }
        
        .list { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 8px; min-height: 0; }
        .empty { 
          padding: 20px; 
          text-align: center; 
          color: var(--text-muted); 
          font-size: 13px;
        }
        .item { 
          display: flex; align-items: center; gap: 8px; 
          padding: 10px 12px; 
          border-radius: 8px; 
          cursor: pointer; 
          font-size: 13px;
          margin-bottom: 4px;
          transition: all 0.1s ease;
        }
        .item:hover { background: var(--bg); }
        .item.selected { background: var(--accent-bg); color: var(--accent); }
        .icon { opacity: 0.7; }
        .item.selected .icon { opacity: 1; }
      `}</style>
        </div>
    );
};
