import React, { useState } from 'react';
import { useSettingsStore } from '../../store/settings';
import { getApiKey, setApiKey, clearApiKey } from '../../services/gemini';
import {
    Key, Check, X, ChevronDown, ChevronRight, Sparkles,
    Zap, Shield, MessageSquare, Bug, RotateCcw
} from 'lucide-react';

type SectionId = 'api' | 'model' | 'behavior' | 'safety' | 'advanced';

export const AISettingsPanel: React.FC = () => {
    const settings = useSettingsStore();
    const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(new Set(['api', 'model']));

    // API Key state
    const [apiKey, setApiKeyLocal] = useState('');
    const [hasKey, setHasKey] = useState(!!getApiKey());
    const [showKeyInput, setShowKeyInput] = useState(false);

    const toggleSection = (id: SectionId) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleSaveKey = () => {
        if (apiKey.trim()) {
            setApiKey(apiKey.trim());
            setHasKey(true);
            setApiKeyLocal('');
            setShowKeyInput(false);
        }
    };

    const handleClearKey = () => {
        clearApiKey();
        setHasKey(false);
    };

    const safetyOptions = [
        { value: 'BLOCK_NONE', label: 'Block None' },
        { value: 'BLOCK_LOW_AND_ABOVE', label: 'Block Low+' },
        { value: 'BLOCK_MEDIUM_AND_ABOVE', label: 'Block Medium+' },
        { value: 'BLOCK_ONLY_HIGH', label: 'Block High Only' },
    ];

    const modelOptions = [
        { value: 'gemini-3.0-flash-latest', label: 'Gemini 3.0 Flash' },
        { value: 'gemini-3.0-pro-latest', label: 'Gemini 3.0 Pro' },
        { value: 'gemini-2.5-flash-exp', label: 'Gemini 2.5 Flash (Exp)' },
    ];

    return (
        <div className="ai-settings">
            {/* API Configuration Section */}
            <div className="section">
                <button className="section-header" onClick={() => toggleSection('api')}>
                    {expandedSections.has('api') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <Key size={14} />
                    <span>API Configuration</span>
                </button>
                {expandedSections.has('api') && (
                    <div className="section-content">
                        {hasKey ? (
                            <div className="key-status">
                                <Check size={14} className="success-icon" />
                                <span>API Key Configured</span>
                                <button onClick={handleClearKey} className="clear-btn">
                                    <X size={12} />
                                </button>
                            </div>
                        ) : showKeyInput ? (
                            <div className="key-input-row">
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKeyLocal(e.target.value)}
                                    placeholder="Paste Gemini API key..."
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
                                />
                                <button onClick={handleSaveKey}><Check size={14} /></button>
                                <button onClick={() => setShowKeyInput(false)}><X size={14} /></button>
                            </div>
                        ) : (
                            <button className="add-key-btn" onClick={() => setShowKeyInput(true)}>
                                <Key size={14} /> Set API Key
                            </button>
                        )}

                        <div className="field">
                            <label>Model</label>
                            <select
                                value={settings.aiModel}
                                onChange={(e) => settings.updateAiSettings({ aiModel: e.target.value })}
                            >
                                {modelOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field toggle-field">
                            <label>Debug Mode</label>
                            <button
                                className={`toggle ${settings.debugMode ? 'active' : ''}`}
                                onClick={() => settings.updateAiSettings({ debugMode: !settings.debugMode })}
                            >
                                <Bug size={12} />
                                {settings.debugMode ? 'On' : 'Off'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Generation Parameters Section */}
            <div className="section">
                <button className="section-header" onClick={() => toggleSection('model')}>
                    {expandedSections.has('model') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <Zap size={14} />
                    <span>Generation Parameters</span>
                </button>
                {expandedSections.has('model') && (
                    <div className="section-content">
                        <div className="field">
                            <label>Temperature <span className="value">{settings.temperature.toFixed(2)}</span></label>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.05"
                                value={settings.temperature}
                                onChange={(e) => settings.updateAiSettings({ temperature: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div className="field">
                            <label>Max Tokens <span className="value">{settings.maxOutputTokens}</span></label>
                            <input
                                type="range"
                                min="256"
                                max="8192"
                                step="256"
                                value={settings.maxOutputTokens}
                                onChange={(e) => settings.updateAiSettings({ maxOutputTokens: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="field">
                            <label>Top-P <span className="value">{settings.topP.toFixed(2)}</span></label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={settings.topP}
                                onChange={(e) => settings.updateAiSettings({ topP: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div className="field">
                            <label>Top-K <span className="value">{settings.topK}</span></label>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                step="1"
                                value={settings.topK}
                                onChange={(e) => settings.updateAiSettings({ topK: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="field toggle-field">
                            <label>Streaming</label>
                            <button
                                className={`toggle ${settings.streamingEnabled ? 'active' : ''}`}
                                onClick={() => settings.updateAiSettings({ streamingEnabled: !settings.streamingEnabled })}
                            >
                                {settings.streamingEnabled ? 'Enabled' : 'Disabled'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Behavior Section */}
            <div className="section">
                <button className="section-header" onClick={() => toggleSection('behavior')}>
                    {expandedSections.has('behavior') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <Sparkles size={14} />
                    <span>Recognition Behavior</span>
                </button>
                {expandedSections.has('behavior') && (
                    <div className="section-content">
                        <div className="field">
                            <label>Confidence Threshold <span className="value">{(settings.confidenceThreshold * 100).toFixed(0)}%</span></label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={settings.confidenceThreshold}
                                onChange={(e) => settings.updateAiSettings({ confidenceThreshold: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div className="field toggle-field">
                            <label>Auto-Fallback</label>
                            <button
                                className={`toggle ${settings.autoFallback ? 'active' : ''}`}
                                onClick={() => settings.updateAiSettings({ autoFallback: !settings.autoFallback })}
                                title="Fallback to manual bake if AI fails"
                            >
                                {settings.autoFallback ? 'On' : 'Off'}
                            </button>
                        </div>

                        <div className="field toggle-field">
                            <label>Strict JSON</label>
                            <button
                                className={`toggle ${settings.jsonStrictMode ? 'active' : ''}`}
                                onClick={() => settings.updateAiSettings({ jsonStrictMode: !settings.jsonStrictMode })}
                            >
                                {settings.jsonStrictMode ? 'On' : 'Off'}
                            </button>
                        </div>

                        <div className="field">
                            <label>Simplification Mode</label>
                            <select
                                value={settings.shapeSimplificationMode}
                                onChange={(e) => settings.updateAiSettings({
                                    shapeSimplificationMode: e.target.value as 'basic' | 'advanced'
                                })}
                            >
                                <option value="basic">Basic</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Safety Settings Section */}
            <div className="section">
                <button className="section-header" onClick={() => toggleSection('safety')}>
                    {expandedSections.has('safety') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <Shield size={14} />
                    <span>Safety Settings</span>
                </button>
                {expandedSections.has('safety') && (
                    <div className="section-content">
                        <div className="field">
                            <label>Harassment</label>
                            <select
                                value={settings.safetyHarassment}
                                onChange={(e) => settings.updateAiSettings({ safetyHarassment: e.target.value as any })}
                            >
                                {safetyOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label>Hate Speech</label>
                            <select
                                value={settings.safetyHateSpeech}
                                onChange={(e) => settings.updateAiSettings({ safetyHateSpeech: e.target.value as any })}
                            >
                                {safetyOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label>Dangerous Content</label>
                            <select
                                value={settings.safetyDangerous}
                                onChange={(e) => settings.updateAiSettings({ safetyDangerous: e.target.value as any })}
                            >
                                {safetyOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label>Sexually Explicit</label>
                            <select
                                value={settings.safetySexuallyExplicit}
                                onChange={(e) => settings.updateAiSettings({ safetySexuallyExplicit: e.target.value as any })}
                            >
                                {safetyOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Advanced / Custom Prompt Section */}
            <div className="section">
                <button className="section-header" onClick={() => toggleSection('advanced')}>
                    {expandedSections.has('advanced') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <MessageSquare size={14} />
                    <span>Custom Prompt</span>
                </button>
                {expandedSections.has('advanced') && (
                    <div className="section-content">
                        <div className="field">
                            <label>System Prompt Override</label>
                            <textarea
                                value={settings.customSystemPrompt}
                                onChange={(e) => settings.updateAiSettings({ customSystemPrompt: e.target.value })}
                                placeholder="Leave empty to use default prompt..."
                                rows={4}
                            />
                            <p className="hint">Override the default shape recognition prompt with custom instructions.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Reset Button */}
            <div className="reset-section">
                <button className="reset-btn" onClick={settings.resetToDefaults}>
                    <RotateCcw size={14} />
                    Reset to Defaults
                </button>
            </div>

            <style>{`
                .ai-settings {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    overflow-y: auto;
                }

                .section {
                    border-bottom: 1px solid var(--line);
                }

                .section-header {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    background: transparent;
                    border: none;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text);
                    cursor: pointer;
                    text-align: left;
                    transition: background 0.15s;
                }
                .section-header:hover {
                    background: var(--bg);
                }

                .section-content {
                    padding: 8px 16px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .field {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .field label {
                    font-size: 11px;
                    color: var(--text-muted);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .field .value {
                    font-family: var(--font-mono);
                    color: var(--accent);
                    font-weight: 500;
                }
                .field input[type="range"] {
                    width: 100%;
                    accent-color: var(--accent);
                }
                .field select,
                .field textarea {
                    width: 100%;
                    padding: 8px 10px;
                    border: 1px solid var(--line);
                    border-radius: var(--radius-xs);
                    background: var(--panel);
                    color: var(--text);
                    font-size: 12px;
                    font-family: inherit;
                }
                .field textarea {
                    resize: vertical;
                    min-height: 80px;
                    font-family: var(--font-mono);
                    font-size: 11px;
                }
                .field select:focus,
                .field textarea:focus {
                    outline: none;
                    border-color: var(--accent);
                }
                .field .hint {
                    font-size: 10px;
                    color: var(--text-dim);
                    margin: 0;
                }

                .toggle-field {
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                }
                .toggle {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 10px;
                    border: 1px solid var(--line);
                    border-radius: var(--radius-xs);
                    background: var(--bg);
                    color: var(--text-muted);
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .toggle:hover {
                    border-color: var(--accent);
                }
                .toggle.active {
                    background: var(--accent-bg);
                    border-color: var(--accent);
                    color: var(--accent);
                }

                .key-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    background: var(--success-bg);
                    border-radius: var(--radius-xs);
                    font-size: 12px;
                }
                .key-status .success-icon {
                    color: var(--success);
                }
                .key-status .clear-btn {
                    margin-left: auto;
                    padding: 4px;
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    border-radius: 4px;
                }
                .key-status .clear-btn:hover {
                    background: var(--danger-bg);
                    color: var(--danger);
                }

                .key-input-row {
                    display: flex;
                    gap: 6px;
                }
                .key-input-row input {
                    flex: 1;
                    padding: 8px 10px;
                    border: 1px solid var(--line);
                    border-radius: var(--radius-xs);
                    font-size: 12px;
                    background: var(--panel);
                    color: var(--text);
                }
                .key-input-row button {
                    padding: 8px;
                    border: 1px solid var(--line);
                    border-radius: var(--radius-xs);
                    background: var(--bg);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .key-input-row button:hover {
                    border-color: var(--accent);
                    color: var(--accent);
                }

                .add-key-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 10px;
                    border: 1px dashed var(--line);
                    border-radius: var(--radius-xs);
                    background: transparent;
                    color: var(--text-muted);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .add-key-btn:hover {
                    border-color: var(--accent);
                    color: var(--accent);
                    background: var(--accent-bg);
                }

                .reset-section {
                    padding: 16px;
                    margin-top: auto;
                }
                .reset-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 10px;
                    border: 1px solid var(--line);
                    border-radius: var(--radius-sm);
                    background: transparent;
                    color: var(--text-muted);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .reset-btn:hover {
                    border-color: var(--danger);
                    color: var(--danger);
                    background: var(--danger-bg);
                }
            `}</style>
        </div>
    );
};
