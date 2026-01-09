import React from 'react';
import './styles/base.css';
import { EditorLayout } from './components/layout/EditorLayout';
import { useProjectStore } from './store/project';
import { initTheme } from './store/settings';

// Initialize theme before render
initTheme();

function App() {
  // Initialize some test data if empty
  const stack = useProjectStore(s => s.stack);
  const addNode = useProjectStore(s => s.addNode);

  React.useEffect(() => {
    if (stack.length === 0) {
      addNode({
        id: 'basis',
        type: 'shape_rect',
        name: 'Base Card',
        visible: true,
        locked: false,
        params: { x: 100, y: 100, width: 400, height: 300, radius: 24 }
      });
      addNode({
        id: 'cutout1',
        type: 'op_subtract',
        name: 'Notch Top',
        visible: true,
        locked: false,
        params: { shapeType: 'circle', x: 300, y: 100, radius: 40 }
      });
    }
  }, []);

  return (
    <div className="app-root">
      <EditorLayout />
    </div>
  );
}

export default App;

