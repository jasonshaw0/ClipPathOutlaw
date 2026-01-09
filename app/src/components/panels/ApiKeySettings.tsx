import React, { useState, useEffect } from 'react';
import { getApiKey, setApiKey, clearApiKey } from '../../services/gemini';
import { Key, Check, X } from 'lucide-react';

export const ApiKeySettings: React.FC = () => {
    const [key, setKey] = useState('');
    const [hasKey, setHasKey] = useState(false);
    const [showInput, setShowInput] = useState(false);

    useEffect(() => {
        setHasKey(!!getApiKey());
    }, []);

    const handleSave = () => {
        if (key.trim()) {
            setApiKey(key.trim());
            setHasKey(true);
            setKey('');
            setShowInput(false);
        }
    };

    const handleClear = () => {
        clearApiKey();
        setHasKey(false);
    };

    return (
        <div className="api-key-settings">
            {hasKey ? (
                <div className="key-status">
                    <Check size={14} className="success" />
                    <span>Gemini API Key Set</span>
                    <button onClick={handleClear} title="Remove Key">
                        <X size={12} />
                    </button>
                </div>
            ) : showInput ? (
                <div className="key-input">
                    <input
                        type="password"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="Paste API key..."
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    />
                    <button onClick={handleSave}><Check size={14} /></button>
                    <button onClick={() => setShowInput(false)}><X size={14} /></button>
                </div>
            ) : (
                <button
                    className="set-key-btn"
                    onClick={() => setShowInput(true)}
                >
                    <Key size={14} /> Set Gemini API Key
                </button>
            )}

            <style>{`
                .api-key-settings {
                    padding: 8px 12px;
                    border-bottom: 1px solid var(--line);
                }
                .key-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    color: var(--text-muted);
                }
                .key-status .success { color: #22c55e; }
                .key-status button {
                    margin-left: auto;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--text-muted);
                    padding: 2px;
                }
                .key-input {
                    display: flex;
                    gap: 4px;
                }
                .key-input input {
                    flex: 1;
                    padding: 4px 8px;
                    border: 1px solid var(--line);
                    border-radius: 4px;
                    font-size: 11px;
                }
                .key-input button {
                    padding: 4px 8px;
                    background: var(--bg);
                    border: 1px solid var(--line);
                    border-radius: 4px;
                    cursor: pointer;
                }
                .set-key-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    width: 100%;
                    padding: 8px;
                    background: var(--bg);
                    border: 1px dashed var(--line);
                    border-radius: 6px;
                    font-size: 11px;
                    color: var(--text-muted);
                    cursor: pointer;
                }
                .set-key-btn:hover {
                    border-color: var(--accent);
                    color: var(--accent);
                }
            `}</style>
        </div>
    );
};
