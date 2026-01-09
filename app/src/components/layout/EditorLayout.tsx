import React, { useState } from 'react';
import { Canvas } from '../canvas/Canvas';
import { Sidebar } from '../panels/Sidebar';
import { Inspector } from '../panels/Inspector';
import { LayersPanel } from '../panels/LayersPanel';
import { StrokeReplay } from '../panels/StrokeReplay';
import { ThemeToggle } from '../ThemeToggle';
import { Settings, Layers, PlayCircle, Hexagon } from 'lucide-react';

type RightTab = 'inspector' | 'layers' | 'replay';

export const EditorLayout: React.FC = () => {
  const [rightTab, setRightTab] = useState<RightTab>('inspector');

  return (
    <div className="layout">
      {/* Top Header */}
      <header className="layout-header">
        <div className="header-brand">
          <Hexagon size={20} className="brand-icon" />
          <span className="brand-name">ClipPath Studio</span>
        </div>
        <div className="header-spacer" />
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <div className="layout-body">
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
              Layers
            </button>
            <button
              className={`right-tab ${rightTab === 'replay' ? 'active' : ''}`}
              onClick={() => setRightTab('replay')}
            >
              <PlayCircle size={14} />
              Replay
            </button>
          </div>
          <div className="right-content">
            {rightTab === 'inspector' && <Inspector />}
            {rightTab === 'layers' && <LayersPanel />}
            {rightTab === 'replay' && <StrokeReplay />}
          </div>
        </div>
      </div>

      <style>{`
        .layout {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
        }
        .layout-header {
          display: flex;
          align-items: center;
          padding: 0 16px;
          height: var(--header-height);
          background: var(--panel);
          border-bottom: 1px solid var(--line);
          flex-shrink: 0;
        }
        .header-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .brand-icon {
          color: var(--accent);
        }
        .brand-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.3px;
        }
        .header-spacer {
          flex: 1;
        }
        .layout-body {
          display: grid;
          grid-template-columns: var(--sidebar-width) 1fr 300px;
          flex: 1;
          overflow: hidden;
        }
        .layout-left, .layout-right {
          background: var(--panel);
          border-right: 1px solid var(--line);
          border-left: 1px solid var(--line);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .layout-left {
          border-left: none;
        }
        .layout-right {
          border-right: none;
        }
        .layout-middle {
          background: var(--canvas-bg);
          position: relative;
          overflow: hidden;
        }
        .right-tabs {
          display: flex;
          border-bottom: 1px solid var(--line);
          background: var(--bg);
        }
        .right-tab {
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
        .right-tab:hover {
          background: var(--panel);
          color: var(--text);
        }
        .right-tab.active {
          color: var(--accent);
          border-bottom-color: var(--accent);
          background: var(--panel);
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

