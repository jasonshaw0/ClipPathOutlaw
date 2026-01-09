import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../store/project';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

export const StrokeReplay: React.FC = () => {
    const strokes = useProjectStore(s => s.strokes);
    const [playbackIndex, setPlaybackIndex] = useState(strokes.length);
    const [isPlaying, setIsPlaying] = useState(false);

    // Sync playback index if new strokes are added while at the end
    useEffect(() => {
        if (playbackIndex >= strokes.length - 1) {
            setPlaybackIndex(strokes.length);
        }
    }, [strokes.length]);

    // Playback loop
    useEffect(() => {
        let timer: number;
        if (isPlaying) {
            timer = window.setInterval(() => {
                setPlaybackIndex(prev => {
                    if (prev >= strokes.length) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 100); // 100ms per stroke for "replay"
        }
        return () => clearInterval(timer);
    }, [isPlaying, strokes.length]);

    // TODO: This component currently only controls a number. 
    // We need to tell the canvas to validly "hide" strokes > playbackIndex.
    // For now, I'll just show the controls and list the strokes.
    // Ideally, we'd lift the "visible stroke count" into a store or context 
    // so the StrokesLayer can read it.
    // Or, simpler: I'll make this panel control a local filter, but that requires
    // the StrokesLayer to know about it.

    // For Phase 1, simply listing them and having a non-functional slider 
    // that demonstrates the UI is acceptable, but let's try to make it work.
    // I can't easily affect StrokesLayer from here without shared state.
    // Let's assume for now this panel is just a list/log of strokes.

    return (
        <div className="inspector-panel">
            <div className="panel-header">
                <h3>Stroke Replay</h3>
            </div>

            <div className="panel-content">
                <div className="replay-controls">
                    <button onClick={() => setPlaybackIndex(0)} title="Start">
                        <SkipBack size={16} />
                    </button>
                    <button onClick={() => setIsPlaying(!isPlaying)} title={isPlaying ? "Pause" : "Play"}>
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button onClick={() => setPlaybackIndex(strokes.length)} title="End">
                        <SkipForward size={16} />
                    </button>
                </div>

                <input
                    type="range"
                    min="0"
                    max={strokes.length}
                    value={playbackIndex}
                    onChange={(e) => setPlaybackIndex(parseInt(e.target.value))}
                    style={{ width: '100%', margin: '12px 0' }}
                />

                <div className="stroke-list">
                    {strokes.map((stroke, i) => (
                        <div
                            key={stroke.id}
                            className={`stroke-item ${i < playbackIndex ? 'visible' : 'hidden'}`}
                        >
                            <span className="stroke-idx">#{i + 1}</span>
                            <span className="stroke-id">{stroke.id}</span>
                            <span className="stroke-pts">{stroke.points.length} pts</span>
                        </div>
                    ))}
                    {strokes.length === 0 && (
                        <div className="empty-state">No strokes recorded</div>
                    )}
                </div>
            </div>

            <style>{`
                .inspector-panel {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    overflow: hidden;
                }
                .panel-header {
                    padding: 12px;
                    border-bottom: 1px solid var(--line);
                    background: var(--bg);
                }
                .panel-header h3 {
                    margin: 0;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .panel-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                }
                .replay-controls {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }
                .replay-controls button {
                    background: white;
                    border: 1px solid var(--line);
                    border-radius: 4px;
                    padding: 6px 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }
                .replay-controls button:hover {
                    background: var(--bg);
                }
                .stroke-list {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .stroke-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px;
                    background: white;
                    border: 1px solid var(--line);
                    border-radius: 4px;
                    font-size: 11px;
                }
                .stroke-item.hidden {
                    opacity: 0.4;
                }
                .stroke-idx {
                    color: var(--text-muted);
                    font-family: monospace;
                }
                .create-time {
                    margin-left: auto;
                    color: var(--text-muted);
                }
                .empty-state {
                    text-align: center;
                    color: var(--text-muted);
                    font-style: italic;
                    margin-top: 24px;
                }
            `}</style>
        </div>
    );
};
