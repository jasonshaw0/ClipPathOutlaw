import React, { useState } from 'react';
import { Canvas } from '../canvas/Canvas';
import { Sidebar } from '../panels/Sidebar';
import { Inspector } from '../panels/Inspector';
import { LayersPanel } from '../panels/LayersPanel';
import { Settings, Layers } from 'lucide-react';

type RightTab = 'inspector' | 'layers';

export const EditorLayout: React.FC = () => {
  const [rightTab, setRightTab] = useState<RightTab>('inspector');

  return (
    <div className="layout">
      <div className="layout-left">
        <Sidebar />
      </div>
      <div className="layout-middle">
        <Canvas />
      </div>
      <div className="layout-right">
        {/* Tabs for right panel */}
        <div className="right-tabs">
          <button
            className={`right-tab ${rightTab === 'inspector' ? 'active' : ''}`}
            onClick={() => setRightTab('inspector')}
          >
            <Settings size={14} />
            Properties
          </button>
          <button
            className={`right-tab ${rightTab === 'layers' ? 'active' : ''}`}
            onClick={() => setRightTab('layers')}
          >
            <Layers size={14} />
            Style Layers
          </button>
        </div>
        <div className="right-content">
          {rightTab === 'inspector' && <Inspector />}
          {rightTab === 'layers' && <LayersPanel />}
        </div>
      </div>
      <style>{`
        .layout {
          display: grid;
          grid-template-columns: var(--sidebar-width) 1fr 320px;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
        }
        .layout-left, .layout-right {
          background: var(--panel);
          border-right: 1px solid var(--line);
          border-left: 1px solid var(--line);
          display: flex;
          flex-direction: column;
        }
        .layout-middle {
          background: #eef2f6; /* Canvas bg */
          position: relative;
          overflow: hidden;
        }
        .right-tabs {
          display: flex;
          border-bottom: 1px solid var(--line);
        }
        .right-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 8px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .right-tab:hover {
          background: var(--bg);
          color: var(--text);
        }
        .right-tab.active {
          color: var(--accent);
          border-bottom-color: var(--accent);
          background: var(--accent-bg);
        }
        .right-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
};
