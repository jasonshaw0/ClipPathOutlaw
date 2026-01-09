/**
 * Micro-Detail Pattern Generators
 * 
 * These generate SVG elements for procedural patterns that can be applied to shapes:
 * - Ticks: Small marks along edges
 * - Rivets: Circular fasteners
 * - Perforations: Holes in regular patterns  
 * - Vents: Slot-like openings
 * - Slits: Thin cuts
 * - Dots: Regular dot patterns
 * - Lines: Parallel line patterns
 */

export type PatternType =
    | 'ticks'
    | 'rivets'
    | 'perforations'
    | 'vents'
    | 'slits'
    | 'dots'
    | 'lines'
    | 'cross-hatch'
    | 'grid'
    | 'diamonds'
    | 'hexagons';

export interface PatternParams {
    patternType: PatternType;
    spacing: number;
    size: number;
    count?: number;
    randomSeed?: number;
    randomness?: number; // 0-1
    alignToEdges?: boolean;
    margin?: number;
    rotation?: number;
    color?: string;
    strokeWidth?: number;
}

export interface PatternDef {
    id: string;
    content: string; // SVG content string
    width: number;
    height: number;
}

// Simple seeded random for consistent patterns (exported for future use)
export function seededRandom(seed: number): () => number {
    return function () {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}

/**
 * Generate SVG pattern definition
 */
export function generatePatternDef(params: PatternParams, id: string): PatternDef {
    const {
        patternType,
        spacing = 20,
        size = 4,
        color = '#000000',
        strokeWidth = 1,
        rotation = 0,
    } = params;

    let content = '';
    let width = spacing;
    let height = spacing;

    switch (patternType) {
        case 'dots':
            content = `<circle cx="${spacing / 2}" cy="${spacing / 2}" r="${size / 2}" fill="${color}"/>`;
            break;

        case 'rivets':
            // Rivet with highlight
            content = `
                <circle cx="${spacing / 2}" cy="${spacing / 2}" r="${size}" fill="${color}" opacity="0.8"/>
                <circle cx="${spacing / 2 - size * 0.2}" cy="${spacing / 2 - size * 0.2}" r="${size * 0.3}" fill="white" opacity="0.4"/>
            `;
            break;

        case 'perforations':
            // Circular holes with slight 3D effect
            content = `
                <circle cx="${spacing / 2}" cy="${spacing / 2}" r="${size}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>
                <circle cx="${spacing / 2}" cy="${spacing / 2}" r="${size * 0.6}" fill="${color}" opacity="0.15"/>
            `;
            break;

        case 'vents':
            // Horizontal slots
            height = spacing * 0.6;
            content = `
                <rect x="${spacing * 0.1}" y="${height * 0.3}" width="${spacing * 0.8}" height="${height * 0.4}" rx="${size / 4}" fill="${color}" opacity="0.7"/>
            `;
            break;

        case 'slits':
            // Thin vertical cuts
            content = `
                <rect x="${spacing / 2 - size / 4}" y="${spacing * 0.15}" width="${size / 2}" height="${spacing * 0.7}" rx="${size / 8}" fill="${color}"/>
            `;
            break;

        case 'ticks':
            // Short perpendicular marks
            content = `
                <rect x="${spacing / 2 - size / 4}" y="${spacing * 0.1}" width="${size / 2}" height="${spacing * 0.3}" fill="${color}"/>
            `;
            break;

        case 'lines':
            // Horizontal lines
            height = spacing / 2;
            content = `
                <line x1="0" y1="${height / 2}" x2="${width}" y2="${height / 2}" stroke="${color}" stroke-width="${strokeWidth}"/>
            `;
            break;

        case 'cross-hatch':
            // Crossed diagonal lines
            content = `
                <line x1="0" y1="0" x2="${spacing}" y2="${spacing}" stroke="${color}" stroke-width="${strokeWidth * 0.5}" opacity="0.6"/>
                <line x1="${spacing}" y1="0" x2="0" y2="${spacing}" stroke="${color}" stroke-width="${strokeWidth * 0.5}" opacity="0.6"/>
            `;
            break;

        case 'grid':
            // Grid lines
            content = `
                <line x1="${spacing / 2}" y1="0" x2="${spacing / 2}" y2="${spacing}" stroke="${color}" stroke-width="${strokeWidth * 0.5}" opacity="0.4"/>
                <line x1="0" y1="${spacing / 2}" x2="${spacing}" y2="${spacing / 2}" stroke="${color}" stroke-width="${strokeWidth * 0.5}" opacity="0.4"/>
            `;
            break;

        case 'diamonds':
            // Diamond shapes
            const half = spacing / 2;
            content = `
                <polygon points="${half},${size} ${spacing - size},${half} ${half},${spacing - size} ${size},${half}" 
                    fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>
            `;
            break;

        case 'hexagons':
            // Hexagonal pattern
            const h = spacing * 0.866; // sqrt(3)/2
            width = spacing * 1.5;
            height = h * 2;
            const pts = [
                [spacing * 0.25, 0],
                [spacing * 0.75, 0],
                [spacing, h],
                [spacing * 0.75, h * 2],
                [spacing * 0.25, h * 2],
                [0, h]
            ].map(p => p.join(',')).join(' ');
            content = `
                <polygon points="${pts}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" opacity="0.5"/>
            `;
            break;

        default:
            content = `<circle cx="${spacing / 2}" cy="${spacing / 2}" r="${size / 2}" fill="${color}"/>`;
    }

    // Wrap with rotation if specified
    if (rotation !== 0) {
        content = `<g transform="rotate(${rotation} ${width / 2} ${height / 2})">${content}</g>`;
    }

    return { id, content, width, height };
}

/**
 * Generate edge-aligned pattern elements along a path
 * This is more complex and would require path parsing
 */
export function generateEdgePattern(
    _pathData: string,
    _params: PatternParams
): { x: number; y: number; rotation: number }[] {
    // Simplified: for now return empty array
    // Full implementation would parse the SVG path and place elements along it
    return [];
}

/**
 * Pattern presets
 */
export const PATTERN_PRESETS: Record<string, Partial<PatternParams>> = {
    'Dot Grid': { patternType: 'dots', spacing: 16, size: 2, color: '#94a3b8' },
    'Dense Dots': { patternType: 'dots', spacing: 8, size: 1.5, color: '#64748b' },
    'Rivets': { patternType: 'rivets', spacing: 30, size: 4, color: '#475569' },
    'Perforated': { patternType: 'perforations', spacing: 20, size: 6, color: '#334155' },
    'Vents': { patternType: 'vents', spacing: 24, size: 3, color: '#1e293b' },
    'Fine Lines': { patternType: 'lines', spacing: 8, size: 1, color: '#cbd5e1', strokeWidth: 0.5 },
    'Wide Lines': { patternType: 'lines', spacing: 20, size: 1, color: '#94a3b8', strokeWidth: 1 },
    'Cross Hatch': { patternType: 'cross-hatch', spacing: 12, size: 1, color: '#64748b', strokeWidth: 0.5 },
    'Blueprint Grid': { patternType: 'grid', spacing: 20, size: 1, color: '#3b82f6', strokeWidth: 0.5 },
    'Diamonds': { patternType: 'diamonds', spacing: 24, size: 4, color: '#6366f1', strokeWidth: 1 },
    'Honeycomb': { patternType: 'hexagons', spacing: 20, size: 1, color: '#f59e0b', strokeWidth: 1 },
    'Technical Ticks': { patternType: 'ticks', spacing: 16, size: 3, color: '#0f172a' },
};

/**
 * Get all pattern type options
 */
export function getPatternTypes(): { value: PatternType; label: string }[] {
    return [
        { value: 'dots', label: 'Dots' },
        { value: 'rivets', label: 'Rivets' },
        { value: 'perforations', label: 'Perforations' },
        { value: 'vents', label: 'Vents' },
        { value: 'slits', label: 'Slits' },
        { value: 'ticks', label: 'Ticks' },
        { value: 'lines', label: 'Lines' },
        { value: 'cross-hatch', label: 'Cross Hatch' },
        { value: 'grid', label: 'Grid' },
        { value: 'diamonds', label: 'Diamonds' },
        { value: 'hexagons', label: 'Hexagons' },
    ];
}
