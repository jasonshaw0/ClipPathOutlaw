import React, { useMemo, useState } from 'react';
import { useProjectStore } from '../../store/project';
import { evaluateStack } from '../../core/geometry';
import { Download, Copy, Code, Check, FileCode, Paintbrush } from 'lucide-react';

type ExportFormat = 'path' | 'svg' | 'css' | 'react' | 'styled' | 'tailwind';

export const ExportPanel: React.FC = () => {
    const stack = useProjectStore(s => s.stack);
    const [copiedFormat, setCopiedFormat] = useState<ExportFormat | null>(null);
    const [coordMode, setCoordMode] = useState<'absolute' | 'relative'>('absolute');

    const svgPath = useMemo(() => {
        try {
            return evaluateStack(stack);
        } catch {
            return '';
        }
    }, [stack]);

    // Full SVG
    const fullSvg = useMemo(() => {
        if (!svgPath) return '';
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500">
  <path d="${svgPath}" fill="#2563eb" fill-rule="evenodd"/>
</svg>`;
    }, [svgPath]);

    // CSS clip-path
    const cssClipPath = useMemo(() => {
        if (!svgPath) return '';
        return `.my-element {
  clip-path: path('${svgPath}');
}`;
    }, [svgPath]);

    // React component
    const reactComponent = useMemo(() => {
        if (!svgPath) return '';
        return `export const ShapeIcon = ({ className, fill = "currentColor" }) => (
  <svg 
    viewBox="0 0 600 500" 
    className={className}
    fill={fill}
  >
    <path d="${svgPath}" fillRule="evenodd" />
  </svg>
);`;
    }, [svgPath]);

    // Styled-components
    const styledComponent = useMemo(() => {
        if (!svgPath) return '';
        return `import styled from 'styled-components';

const ShapeContainer = styled.div\`
  clip-path: path('${svgPath}');
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Adjust dimensions as needed */
  width: 600px;
  height: 500px;
\`;`;
    }, [svgPath]);

    // Tailwind arbitrary value
    const tailwindClip = useMemo(() => {
        if (!svgPath) return '';
        // Tailwind needs escaped path
        const escaped = svgPath.replace(/'/g, "\\'");
        return `<!-- Tailwind CSS -->
<div class="bg-gradient-to-br from-indigo-500 to-purple-600 [clip-path:path('${escaped}')]">
  <!-- Content -->
</div>`;
    }, [svgPath]);

    const copyToClipboard = async (text: string, format: ExportFormat) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedFormat(format);
            setTimeout(() => setCopiedFormat(null), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const downloadSvg = () => {
        const blob = new Blob([fullSvg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'shape.svg';
        a.click();
        URL.revokeObjectURL(url);
    };

    const CopyButton: React.FC<{ format: ExportFormat; text: string }> = ({ format, text }) => (
        <button
            className={`icon-btn ${copiedFormat === format ? 'copied' : ''}`}
            onClick={() => copyToClipboard(text, format)}
            title="Copy to clipboard"
        >
            {copiedFormat === format ? <Check size={12} /> : <Copy size={12} />}
        </button>
    );

    const ExportSection: React.FC<{
        title: string;
        icon: React.ReactNode;
        format: ExportFormat;
        content: string;
        rows?: number;
        extra?: React.ReactNode;
    }> = ({ title, icon, format, content, rows = 4, extra }) => (
        <div className="export-section">
            <div className="section-header">
                {icon}
                <span>{title}</span>
                <CopyButton format={format} text={content} />
                {extra}
            </div>
            <textarea className="code-block" readOnly value={content} rows={rows} />
        </div>
    );

    return (
        <div className="export-panel">
            {/* Coord mode toggle */}
            <div className="coord-toggle">
                <button
                    className={coordMode === 'absolute' ? 'active' : ''}
                    onClick={() => setCoordMode('absolute')}
                >
                    Absolute
                </button>
                <button
                    className={coordMode === 'relative' ? 'active' : ''}
                    onClick={() => setCoordMode('relative')}
                >
                    Relative
                </button>
            </div>

            <ExportSection
                title="SVG Path"
                icon={<Code size={14} />}
                format="path"
                content={svgPath}
                rows={3}
            />

            <ExportSection
                title="Full SVG"
                icon={<FileCode size={14} />}
                format="svg"
                content={fullSvg}
                rows={4}
                extra={
                    <button className="icon-btn" onClick={downloadSvg} title="Download SVG">
                        <Download size={12} />
                    </button>
                }
            />

            <ExportSection
                title="CSS Clip-Path"
                icon={<Paintbrush size={14} />}
                format="css"
                content={cssClipPath}
                rows={3}
            />

            <ExportSection
                title="React Component"
                icon={<FileCode size={14} />}
                format="react"
                content={reactComponent}
                rows={6}
            />

            <ExportSection
                title="Styled-Components"
                icon={<Paintbrush size={14} />}
                format="styled"
                content={styledComponent}
                rows={6}
            />

            <ExportSection
                title="Tailwind CSS"
                icon={<Paintbrush size={14} />}
                format="tailwind"
                content={tailwindClip}
                rows={4}
            />

            <style>{`
                .export-panel {
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    overflow-y: auto;
                }
                .coord-toggle {
                    display: flex;
                    gap: 4px;
                    margin-bottom: 4px;
                }
                .coord-toggle button {
                    flex: 1;
                    padding: 6px 12px;
                    font-size: 11px;
                    background: var(--bg);
                    border: 1px solid var(--line);
                    border-radius: 4px;
                    cursor: pointer;
                }
                .coord-toggle button.active {
                    background: var(--accent-bg);
                    border-color: var(--accent);
                    color: var(--accent);
                }
                .export-section {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text);
                }
                .section-header .icon-btn {
                    margin-left: auto;
                    padding: 4px;
                    background: transparent;
                    border: 1px solid var(--line);
                    border-radius: 4px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s ease;
                }
                .section-header .icon-btn:hover {
                    background: var(--bg);
                }
                .section-header .icon-btn.copied {
                    background: #dcfce7;
                    border-color: #16a34a;
                    color: #16a34a;
                }
                .section-header .icon-btn + .icon-btn {
                    margin-left: 4px;
                }
                .code-block {
                    font-family: var(--font-mono);
                    font-size: 10px;
                    line-height: 1.4;
                    padding: 8px;
                    background: var(--bg);
                    border: 1px solid var(--line);
                    border-radius: 6px;
                    resize: none;
                    color: var(--text);
                }
            `}</style>
        </div>
    );
};
