import React, { useState, useMemo } from 'react';
import { useProjectStore } from '../../store/project';
import { getPresetsByCategory, applyPreset, searchPresets, type Preset } from '../../core/presets';
import { Search, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';

export const PresetsPanel: React.FC = () => {
  const { addNode, removeNode, stack, setSelection } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Cards', 'Buttons', 'Badges', 'Tabs', 'Panels', 'Decorative']));
  const [allExpanded, setAllExpanded] = useState(true);

  const handleApplyPreset = (preset: Preset) => {
    stack.forEach(node => removeNode(node.id));
    const nodes = applyPreset(preset);
    nodes.forEach(node => addNode(node));
    if (nodes.length > 0) {
      setSelection(nodes[0].id);
    }
  };

  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchPresets(searchQuery);
  }, [searchQuery]);

  const presetsByCategory = useMemo(() => getPresetsByCategory(), []);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedCategories(new Set());
    } else {
      setExpandedCategories(new Set(Object.keys(presetsByCategory)));
    }
    setAllExpanded(!allExpanded);
  };

  const renderPresetItem = (preset: Preset) => (
    <div
      key={preset.id}
      className="preset-item"
      onClick={() => handleApplyPreset(preset)}
      title={preset.description}
    >
      <span className="preset-name">{preset.name}</span>
      <span className="preset-desc">{preset.description}</span>
    </div>
  );

  return (
    <div className="presets-panel">
      {/* Search + Toggle */}
      <div className="search-bar">
        <Search size={14} />
        <input
          type="text"
          placeholder="Search presets..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <button className="toggle-all" onClick={toggleAll} title={allExpanded ? 'Collapse All' : 'Expand All'}>
          {allExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Results */}
      <div className="presets-list">
        {filteredPresets ? (
          <div className="search-results">
            <div className="results-header">
              {filteredPresets.length} result{filteredPresets.length !== 1 ? 's' : ''}
            </div>
            {filteredPresets.length === 0 && (
              <div className="empty">No presets match your search</div>
            )}
            <div className="results-grid">
              {filteredPresets.map(renderPresetItem)}
            </div>
          </div>
        ) : (
          Object.entries(presetsByCategory).map(([category, presets]) => (
            <div key={category} className="category">
              <button
                className="category-header"
                onClick={() => toggleCategory(category)}
              >
                {expandedCategories.has(category)
                  ? <ChevronDown size={12} />
                  : <ChevronRight size={12} />
                }
                <span className="category-name">{category}</span>
                <span className="category-count">{presets.length}</span>
              </button>
              {expandedCategories.has(category) && (
                <div className="category-presets">
                  {presets.map(renderPresetItem)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <style>{`
                .presets-panel {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    min-height: 0;
                }
                .search-bar {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    border-bottom: 1px solid var(--line);
                    flex-shrink: 0;
                }
                .search-bar input {
                    flex: 1;
                    border: none;
                    background: var(--bg);
                    padding: 6px 10px;
                    border-radius: 4px;
                    font-size: 11px;
                    outline: none;
                }
                .search-bar input:focus {
                    box-shadow: 0 0 0 2px var(--accent-bg);
                }
                .toggle-all {
                    padding: 4px;
                    background: transparent;
                    border: 1px solid var(--line);
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }
                .toggle-all:hover {
                    background: var(--bg);
                }
                .presets-list {
                    flex: 1;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: 4px 8px;
                    min-height: 0;
                }
                .category {
                    margin-bottom: 2px;
                }
                .category-header {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    width: 100%;
                    padding: 6px 8px;
                    background: transparent;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11px;
                    font-weight: 600;
                    text-align: left;
                }
                .category-header:hover {
                    background: var(--bg);
                }
                .category-name {
                    flex: 1;
                }
                .category-count {
                    font-size: 9px;
                    color: var(--text-muted);
                    background: var(--bg);
                    padding: 1px 5px;
                    border-radius: 8px;
                }
                .category-presets {
                    padding: 2px 0 4px 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }
                .results-header {
                    font-size: 10px;
                    color: var(--text-muted);
                    padding: 4px 8px;
                    margin-bottom: 4px;
                }
                .results-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }
                .empty {
                    padding: 16px;
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 11px;
                }
                .preset-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 5px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background 0.1s ease;
                }
                .preset-item:hover {
                    background: var(--accent-bg);
                }
                .preset-name {
                    font-size: 11px;
                    font-weight: 500;
                    white-space: nowrap;
                }
                .preset-desc {
                    font-size: 10px;
                    color: var(--text-muted);
                    flex: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            `}</style>
    </div>
  );
};
