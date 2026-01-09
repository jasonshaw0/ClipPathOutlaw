import type { OperationNode } from '../store/project';

// A preset is a pre-configured set of operations that create a specific shape
export interface Preset {
    id: string;
    name: string;
    category: string;
    description: string;
    thumbnail?: string; // SVG path for preview
    tags?: string[];
    nodes: Omit<OperationNode, 'id'>[]; // Nodes without IDs (will be generated on apply)
}

const uid = () => Math.random().toString(36).slice(2, 9);

export const PRESETS: Preset[] = [
    // ======================================
    // === CARDS ===
    // ======================================
    {
        id: 'card-basic',
        name: 'Basic Card',
        category: 'Cards',
        description: 'Simple rounded rectangle',
        tags: ['simple', 'rounded', 'container'],
        nodes: [
            { type: 'shape_rect', name: 'Card Body', visible: true, locked: false, params: { x: 100, y: 100, width: 400, height: 300, radius: 24 } }
        ]
    },
    {
        id: 'card-notch-top',
        name: 'Top Notch Card',
        category: 'Cards',
        description: 'Card with circular notch at top center',
        tags: ['notch', 'avatar', 'profile'],
        nodes: [
            { type: 'shape_rect', name: 'Card Body', visible: true, locked: false, params: { x: 100, y: 100, width: 400, height: 300, radius: 24 } },
            { type: 'op_subtract', name: 'Top Notch', visible: true, locked: false, params: { shapeType: 'circle', x: 300, y: 100, radius: 40 } }
        ]
    },
    {
        id: 'card-ticket',
        name: 'Ticket Card',
        category: 'Cards',
        description: 'Card with side notches like a ticket stub',
        tags: ['ticket', 'coupon', 'voucher'],
        nodes: [
            { type: 'shape_rect', name: 'Ticket Body', visible: true, locked: false, params: { x: 100, y: 100, width: 400, height: 200, radius: 16 } },
            { type: 'op_subtract', name: 'Left Notch', visible: true, locked: false, params: { shapeType: 'circle', x: 100, y: 200, radius: 24 } },
            { type: 'op_subtract', name: 'Right Notch', visible: true, locked: false, params: { shapeType: 'circle', x: 500, y: 200, radius: 24 } }
        ]
    },
    {
        id: 'card-corner-bite',
        name: 'Corner Bite Card',
        category: 'Cards',
        description: 'Card with corners cut out',
        tags: ['corner', 'bite', 'modern'],
        nodes: [
            { type: 'shape_rect', name: 'Card Body', visible: true, locked: false, params: { x: 100, y: 100, width: 400, height: 300, radius: 12 } },
            { type: 'op_subtract', name: 'Top-Left Bite', visible: true, locked: false, params: { shapeType: 'circle', x: 100, y: 100, radius: 30 } },
            { type: 'op_subtract', name: 'Bottom-Right Bite', visible: true, locked: false, params: { shapeType: 'circle', x: 500, y: 400, radius: 30 } }
        ]
    },
    {
        id: 'card-film-strip',
        name: 'Film Strip Card',
        category: 'Cards',
        description: 'Perforated edges like film',
        tags: ['film', 'perforated', 'media'],
        nodes: [
            { type: 'shape_rect', name: 'Film Body', visible: true, locked: false, params: { x: 80, y: 100, width: 440, height: 240, radius: 4 } },
            // Left perforations
            { type: 'op_subtract', name: 'L Perf 1', visible: true, locked: false, params: { shapeType: 'rect', x: 80, y: 120, width: 20, height: 16, radius: 4 } },
            { type: 'op_subtract', name: 'L Perf 2', visible: true, locked: false, params: { shapeType: 'rect', x: 80, y: 160, width: 20, height: 16, radius: 4 } },
            { type: 'op_subtract', name: 'L Perf 3', visible: true, locked: false, params: { shapeType: 'rect', x: 80, y: 200, width: 20, height: 16, radius: 4 } },
            { type: 'op_subtract', name: 'L Perf 4', visible: true, locked: false, params: { shapeType: 'rect', x: 80, y: 240, width: 20, height: 16, radius: 4 } },
            { type: 'op_subtract', name: 'L Perf 5', visible: true, locked: false, params: { shapeType: 'rect', x: 80, y: 280, width: 20, height: 16, radius: 4 } },
            // Right perforations
            { type: 'op_subtract', name: 'R Perf 1', visible: true, locked: false, params: { shapeType: 'rect', x: 500, y: 120, width: 20, height: 16, radius: 4 } },
            { type: 'op_subtract', name: 'R Perf 2', visible: true, locked: false, params: { shapeType: 'rect', x: 500, y: 160, width: 20, height: 16, radius: 4 } },
            { type: 'op_subtract', name: 'R Perf 3', visible: true, locked: false, params: { shapeType: 'rect', x: 500, y: 200, width: 20, height: 16, radius: 4 } },
            { type: 'op_subtract', name: 'R Perf 4', visible: true, locked: false, params: { shapeType: 'rect', x: 500, y: 240, width: 20, height: 16, radius: 4 } },
            { type: 'op_subtract', name: 'R Perf 5', visible: true, locked: false, params: { shapeType: 'rect', x: 500, y: 280, width: 20, height: 16, radius: 4 } },
        ]
    },
    {
        id: 'card-arch-top',
        name: 'Arch Top Card',
        category: 'Cards',
        description: 'Card with arched top edge',
        tags: ['arch', 'elegant', 'ticket'],
        nodes: [
            { type: 'shape_rect', name: 'Card Body', visible: true, locked: false, params: { x: 100, y: 150, width: 400, height: 250, radius: 0 } },
            { type: 'op_union', name: 'Arch Top', visible: true, locked: false, params: { shapeType: 'circle', x: 300, y: 150, radius: 200 } },
            { type: 'op_subtract', name: 'Trim Left', visible: true, locked: false, params: { shapeType: 'rect', x: 0, y: 0, width: 100, height: 500, radius: 0 } },
            { type: 'op_subtract', name: 'Trim Right', visible: true, locked: false, params: { shapeType: 'rect', x: 500, y: 0, width: 100, height: 500, radius: 0 } },
        ]
    },
    {
        id: 'card-stepped',
        name: 'Stepped Card',
        category: 'Cards',
        description: 'Card with stepped top-right corner',
        tags: ['stepped', 'industrial', 'modern'],
        nodes: [
            { type: 'shape_rect', name: 'Main Body', visible: true, locked: false, params: { x: 100, y: 100, width: 400, height: 300, radius: 8 } },
            { type: 'op_subtract', name: 'Step Cut 1', visible: true, locked: false, params: { shapeType: 'rect', x: 440, y: 100, width: 60, height: 30, radius: 0 } },
            { type: 'op_subtract', name: 'Step Cut 2', visible: true, locked: false, params: { shapeType: 'rect', x: 470, y: 100, width: 30, height: 60, radius: 0 } },
        ]
    },

    // ======================================
    // === BUTTONS ===
    // ======================================
    {
        id: 'btn-pill',
        name: 'Pill Button',
        category: 'Buttons',
        description: 'Fully rounded pill shape',
        tags: ['pill', 'rounded', 'modern'],
        nodes: [
            { type: 'shape_rect', name: 'Pill', visible: true, locked: false, params: { x: 150, y: 200, width: 200, height: 56, radius: 28 } }
        ]
    },
    {
        id: 'btn-notched',
        name: 'Notched Button',
        category: 'Buttons',
        description: 'Button with corner notches',
        tags: ['notched', 'scifi', 'tech'],
        nodes: [
            { type: 'shape_rect', name: 'Button Body', visible: true, locked: false, params: { x: 150, y: 200, width: 200, height: 56, radius: 8 } },
            { type: 'op_subtract', name: 'TL Notch', visible: true, locked: false, params: { shapeType: 'circle', x: 150, y: 200, radius: 12 } },
            { type: 'op_subtract', name: 'BR Notch', visible: true, locked: false, params: { shapeType: 'circle', x: 350, y: 256, radius: 12 } }
        ]
    },
    {
        id: 'btn-chamfered',
        name: 'Chamfered Button',
        category: 'Buttons',
        description: 'Button with angled corners',
        tags: ['chamfer', 'angular', 'game'],
        nodes: [
            { type: 'shape_rect', name: 'Body', visible: true, locked: false, params: { x: 150, y: 200, width: 200, height: 56, radius: 0 } },
            { type: 'op_subtract', name: 'TL Chamfer', visible: true, locked: false, params: { shapeType: 'rect', x: 138, y: 188, width: 24, height: 24, radius: 0 } },
            { type: 'op_subtract', name: 'BR Chamfer', visible: true, locked: false, params: { shapeType: 'rect', x: 338, y: 244, width: 24, height: 24, radius: 0 } },
        ]
    },
    {
        id: 'btn-arrow',
        name: 'Arrow Button',
        category: 'Buttons',
        description: 'Button with pointed right end',
        tags: ['arrow', 'action', 'next'],
        nodes: [
            { type: 'shape_rect', name: 'Body', visible: true, locked: false, params: { x: 150, y: 200, width: 180, height: 56, radius: 8 } },
            { type: 'op_union', name: 'Arrow Head', visible: true, locked: false, params: { shapeType: 'circle', x: 330, y: 228, radius: 28 } },
        ]
    },
    {
        id: 'btn-tab',
        name: 'Tab Button',
        category: 'Buttons',
        description: 'Navigation tab with inverted corners',
        tags: ['tab', 'navigation', 'inverted'],
        nodes: [
            { type: 'shape_rect', name: 'Tab Body', visible: true, locked: false, params: { x: 150, y: 200, width: 160, height: 44, radius: 12 } },
            { type: 'op_subtract', name: 'Left Inv', visible: true, locked: false, params: { shapeType: 'circle', x: 150, y: 244, radius: 12 } },
            { type: 'op_subtract', name: 'Right Inv', visible: true, locked: false, params: { shapeType: 'circle', x: 310, y: 244, radius: 12 } },
        ]
    },
    {
        id: 'btn-hex',
        name: 'Hexagonal Button',
        category: 'Buttons',
        description: 'Hexagonal action button',
        tags: ['hex', 'game', 'action'],
        nodes: [
            { type: 'shape_rect', name: 'Hex Body', visible: true, locked: false, params: { x: 180, y: 200, width: 140, height: 60, radius: 0 } },
            { type: 'op_union', name: 'Left Cap', visible: true, locked: false, params: { shapeType: 'circle', x: 180, y: 230, radius: 30 } },
            { type: 'op_union', name: 'Right Cap', visible: true, locked: false, params: { shapeType: 'circle', x: 320, y: 230, radius: 30 } },
        ]
    },

    // ======================================
    // === BADGES ===
    // ======================================
    {
        id: 'badge-circle',
        name: 'Circle Badge',
        category: 'Badges',
        description: 'Simple circle',
        tags: ['circle', 'status', 'notification'],
        nodes: [
            { type: 'shape_circle', name: 'Badge', visible: true, locked: false, params: { x: 250, y: 250, radius: 60 } }
        ]
    },
    {
        id: 'badge-donut',
        name: 'Donut Badge',
        category: 'Badges',
        description: 'Circle with hole',
        tags: ['donut', 'ring', 'progress'],
        nodes: [
            { type: 'shape_circle', name: 'Outer', visible: true, locked: false, params: { x: 250, y: 250, radius: 60 } },
            { type: 'op_subtract', name: 'Inner Hole', visible: true, locked: false, params: { shapeType: 'circle', x: 250, y: 250, radius: 30 } }
        ]
    },
    {
        id: 'badge-star',
        name: 'Star Badge',
        category: 'Badges',
        description: 'Four-pointed star using overlapping rects',
        tags: ['star', 'achievement', 'favorite'],
        nodes: [
            { type: 'shape_rect', name: 'Horizontal', visible: true, locked: false, params: { x: 180, y: 220, width: 140, height: 60, radius: 30 } },
            { type: 'op_union', name: 'Vertical', visible: true, locked: false, params: { shapeType: 'rect', x: 220, y: 180, width: 60, height: 140, radius: 30 } }
        ]
    },
    {
        id: 'badge-shield',
        name: 'Shield Badge',
        category: 'Badges',
        description: 'Shield-shaped security badge',
        tags: ['shield', 'security', 'verified'],
        nodes: [
            { type: 'shape_rect', name: 'Top', visible: true, locked: false, params: { x: 180, y: 160, width: 140, height: 100, radius: 16 } },
            { type: 'op_union', name: 'Point', visible: true, locked: false, params: { shapeType: 'circle', x: 250, y: 260, radius: 70 } },
            { type: 'op_subtract', name: 'Trim Left', visible: true, locked: false, params: { shapeType: 'rect', x: 100, y: 250, width: 80, height: 100, radius: 0 } },
            { type: 'op_subtract', name: 'Trim Right', visible: true, locked: false, params: { shapeType: 'rect', x: 320, y: 250, width: 80, height: 100, radius: 0 } },
        ]
    },
    {
        id: 'badge-ribbon',
        name: 'Ribbon Badge',
        category: 'Badges',
        description: 'Award ribbon shape',
        tags: ['ribbon', 'award', 'achievement'],
        nodes: [
            { type: 'shape_circle', name: 'Medal', visible: true, locked: false, params: { x: 250, y: 200, radius: 50 } },
            { type: 'op_union', name: 'Ribbon Left', visible: true, locked: false, params: { shapeType: 'rect', x: 200, y: 240, width: 40, height: 80, radius: 4 } },
            { type: 'op_union', name: 'Ribbon Right', visible: true, locked: false, params: { shapeType: 'rect', x: 260, y: 240, width: 40, height: 80, radius: 4 } },
        ]
    },

    // ======================================
    // === TABS ===
    // ======================================
    {
        id: 'tab-inverted',
        name: 'Inverted Tab',
        category: 'Tabs',
        description: 'Browser-style tab with inverted corners',
        tags: ['browser', 'navigation', 'inverted'],
        nodes: [
            { type: 'shape_rect', name: 'Tab Body', visible: true, locked: false, params: { x: 100, y: 150, width: 180, height: 50, radius: 16 } },
            { type: 'op_subtract', name: 'Left Invert', visible: true, locked: false, params: { shapeType: 'circle', x: 100, y: 200, radius: 16 } },
            { type: 'op_subtract', name: 'Right Invert', visible: true, locked: false, params: { shapeType: 'circle', x: 280, y: 200, radius: 16 } }
        ]
    },
    {
        id: 'tab-pill',
        name: 'Pill Tab',
        category: 'Tabs',
        description: 'Rounded pill-shaped tab',
        tags: ['pill', 'segmented', 'modern'],
        nodes: [
            { type: 'shape_rect', name: 'Tab', visible: true, locked: false, params: { x: 100, y: 170, width: 140, height: 36, radius: 18 } }
        ]
    },
    {
        id: 'tab-folder',
        name: 'Folder Tab',
        category: 'Tabs',
        description: 'File folder style tab',
        tags: ['folder', 'file', 'document'],
        nodes: [
            { type: 'shape_rect', name: 'Tab Root', visible: true, locked: false, params: { x: 100, y: 160, width: 180, height: 40, radius: 8 } },
            { type: 'op_union', name: 'Body', visible: true, locked: false, params: { shapeType: 'rect', x: 80, y: 200, width: 400, height: 200, radius: 8 } },
        ]
    },

    // ======================================
    // === PANELS ===
    // ======================================
    {
        id: 'panel-corner-cut',
        name: 'Corner Cut Panel',
        category: 'Panels',
        description: 'Panel with cut corner',
        tags: ['corner', 'scifi', 'tech'],
        nodes: [
            { type: 'shape_rect', name: 'Panel', visible: true, locked: false, params: { x: 80, y: 80, width: 440, height: 340, radius: 8 } },
            { type: 'op_subtract', name: 'Corner Cut', visible: true, locked: false, params: { shapeType: 'rect', x: 460, y: 360, width: 80, height: 80, radius: 0 } },
        ]
    },
    {
        id: 'panel-notched-edges',
        name: 'Notched Edge Panel',
        category: 'Panels',
        description: 'Industrial panel with edge notches',
        tags: ['industrial', 'mechanical', 'tech'],
        nodes: [
            { type: 'shape_rect', name: 'Panel', visible: true, locked: false, params: { x: 80, y: 80, width: 440, height: 340, radius: 4 } },
            { type: 'op_subtract', name: 'Top Notch', visible: true, locked: false, params: { shapeType: 'rect', x: 260, y: 80, width: 80, height: 20, radius: 10 } },
            { type: 'op_subtract', name: 'Bottom Notch', visible: true, locked: false, params: { shapeType: 'rect', x: 260, y: 400, width: 80, height: 20, radius: 10 } },
            { type: 'op_subtract', name: 'Left Notch', visible: true, locked: false, params: { shapeType: 'rect', x: 80, y: 220, width: 20, height: 60, radius: 10 } },
            { type: 'op_subtract', name: 'Right Notch', visible: true, locked: false, params: { shapeType: 'rect', x: 500, y: 220, width: 20, height: 60, radius: 10 } },
        ]
    },
    {
        id: 'panel-window',
        name: 'Window Panel',
        category: 'Panels',
        description: 'Panel with inner window cutout',
        tags: ['window', 'frame', 'display'],
        nodes: [
            { type: 'shape_rect', name: 'Outer Frame', visible: true, locked: false, params: { x: 80, y: 80, width: 440, height: 340, radius: 24 } },
            { type: 'op_subtract', name: 'Window', visible: true, locked: false, params: { shapeType: 'rect', x: 120, y: 120, width: 360, height: 260, radius: 16 } },
        ]
    },
    {
        id: 'panel-hud',
        name: 'HUD Panel',
        category: 'Panels',
        description: 'Sci-fi heads-up display panel',
        tags: ['hud', 'scifi', 'futuristic'],
        nodes: [
            { type: 'shape_rect', name: 'Main Panel', visible: true, locked: false, params: { x: 100, y: 100, width: 400, height: 300, radius: 0 } },
            { type: 'op_subtract', name: 'TL Cut', visible: true, locked: false, params: { shapeType: 'rect', x: 70, y: 70, width: 60, height: 60, radius: 0 } },
            { type: 'op_subtract', name: 'TR Cut', visible: true, locked: false, params: { shapeType: 'rect', x: 470, y: 70, width: 60, height: 60, radius: 0 } },
            { type: 'op_subtract', name: 'BL Cut', visible: true, locked: false, params: { shapeType: 'rect', x: 70, y: 370, width: 60, height: 60, radius: 0 } },
            { type: 'op_subtract', name: 'BR Cut', visible: true, locked: false, params: { shapeType: 'rect', x: 470, y: 370, width: 60, height: 60, radius: 0 } },
            { type: 'op_subtract', name: 'Top Slot', visible: true, locked: false, params: { shapeType: 'rect', x: 200, y: 100, width: 200, height: 12, radius: 6 } },
        ]
    },

    // ======================================
    // === COMPLEX ===
    // ======================================
    {
        id: 'slot-machine',
        name: 'Slot Machine',
        category: 'Complex',
        description: 'Multi-cutout display panel',
        tags: ['slots', 'casino', 'display'],
        nodes: [
            { type: 'shape_rect', name: 'Frame', visible: true, locked: false, params: { x: 50, y: 50, width: 500, height: 400, radius: 32 } },
            { type: 'op_subtract', name: 'Slot 1', visible: true, locked: false, params: { shapeType: 'rect', x: 80, y: 100, width: 120, height: 200, radius: 16 } },
            { type: 'op_subtract', name: 'Slot 2', visible: true, locked: false, params: { shapeType: 'rect', x: 220, y: 100, width: 120, height: 200, radius: 16 } },
            { type: 'op_subtract', name: 'Slot 3', visible: true, locked: false, params: { shapeType: 'rect', x: 360, y: 100, width: 120, height: 200, radius: 16 } }
        ]
    },
    {
        id: 'phone-notch',
        name: 'Phone Notch',
        category: 'Complex',
        description: 'Smartphone-style notch at top',
        tags: ['phone', 'notch', 'device'],
        nodes: [
            { type: 'shape_rect', name: 'Screen', visible: true, locked: false, params: { x: 100, y: 50, width: 300, height: 500, radius: 40 } },
            { type: 'op_subtract', name: 'Notch', visible: true, locked: false, params: { shapeType: 'rect', x: 175, y: 50, width: 150, height: 35, radius: 18 } }
        ]
    },
    {
        id: 'phone-dynamic-island',
        name: 'Dynamic Island',
        category: 'Complex',
        description: 'iPhone-style dynamic island',
        tags: ['phone', 'island', 'ios'],
        nodes: [
            { type: 'shape_rect', name: 'Screen', visible: true, locked: false, params: { x: 100, y: 50, width: 300, height: 500, radius: 40 } },
            { type: 'op_subtract', name: 'Island', visible: true, locked: false, params: { shapeType: 'rect', x: 190, y: 65, width: 120, height: 28, radius: 14 } }
        ]
    },
    {
        id: 'control-panel',
        name: 'Control Panel',
        category: 'Complex',
        description: 'Dashboard-style control panel',
        tags: ['dashboard', 'controls', 'industrial'],
        nodes: [
            { type: 'shape_rect', name: 'Panel Base', visible: true, locked: false, params: { x: 50, y: 80, width: 500, height: 340, radius: 16 } },
            // Display cutout
            { type: 'op_subtract', name: 'Display', visible: true, locked: false, params: { shapeType: 'rect', x: 80, y: 110, width: 240, height: 120, radius: 12 } },
            // Button cutouts
            { type: 'op_subtract', name: 'Btn 1', visible: true, locked: false, params: { shapeType: 'circle', x: 390, y: 140, radius: 25 } },
            { type: 'op_subtract', name: 'Btn 2', visible: true, locked: false, params: { shapeType: 'circle', x: 460, y: 140, radius: 25 } },
            { type: 'op_subtract', name: 'Btn 3', visible: true, locked: false, params: { shapeType: 'circle', x: 390, y: 210, radius: 25 } },
            { type: 'op_subtract', name: 'Btn 4', visible: true, locked: false, params: { shapeType: 'circle', x: 460, y: 210, radius: 25 } },
            // Slider slots
            { type: 'op_subtract', name: 'Slider 1', visible: true, locked: false, params: { shapeType: 'rect', x: 80, y: 270, width: 100, height: 20, radius: 10 } },
            { type: 'op_subtract', name: 'Slider 2', visible: true, locked: false, params: { shapeType: 'rect', x: 200, y: 270, width: 100, height: 20, radius: 10 } },
            { type: 'op_subtract', name: 'Slider 3', visible: true, locked: false, params: { shapeType: 'rect', x: 320, y: 270, width: 100, height: 20, radius: 10 } },
        ]
    },
    {
        id: 'keyboard-key',
        name: 'Keyboard Key',
        category: 'Complex',
        description: 'Keycap with inset',
        tags: ['keyboard', 'key', 'input'],
        nodes: [
            { type: 'shape_rect', name: 'Key Cap', visible: true, locked: false, params: { x: 180, y: 180, width: 80, height: 80, radius: 12 } },
            { type: 'op_subtract', name: 'Inset', visible: true, locked: false, params: { shapeType: 'rect', x: 186, y: 184, width: 68, height: 68, radius: 8 } },
        ]
    },
    {
        id: 'gamepad',
        name: 'Gamepad Outline',
        category: 'Complex',
        description: 'Game controller body',
        tags: ['game', 'controller', 'gaming'],
        nodes: [
            { type: 'shape_rect', name: 'Body Center', visible: true, locked: false, params: { x: 150, y: 180, width: 300, height: 140, radius: 30 } },
            { type: 'op_union', name: 'Left Grip', visible: true, locked: false, params: { shapeType: 'circle', x: 150, y: 250, radius: 70 } },
            { type: 'op_union', name: 'Right Grip', visible: true, locked: false, params: { shapeType: 'circle', x: 450, y: 250, radius: 70 } },
            { type: 'op_subtract', name: 'Left Stick', visible: true, locked: false, params: { shapeType: 'circle', x: 210, y: 230, radius: 25 } },
            { type: 'op_subtract', name: 'Right Stick', visible: true, locked: false, params: { shapeType: 'circle', x: 390, y: 270, radius: 25 } },
            { type: 'op_subtract', name: 'D-Pad', visible: true, locked: false, params: { shapeType: 'rect', x: 190, y: 260, width: 40, height: 40, radius: 4 } },
            { type: 'op_subtract', name: 'A Btn', visible: true, locked: false, params: { shapeType: 'circle', x: 430, y: 230, radius: 12 } },
            { type: 'op_subtract', name: 'B Btn', visible: true, locked: false, params: { shapeType: 'circle', x: 390, y: 200, radius: 12 } },
        ]
    },

    // ======================================
    // === DECORATIVE ===
    // ======================================
    {
        id: 'frame-ornate',
        name: 'Ornate Frame',
        category: 'Decorative',
        description: 'Frame with decorative corners',
        tags: ['frame', 'ornate', 'vintage'],
        nodes: [
            { type: 'shape_rect', name: 'Outer Frame', visible: true, locked: false, params: { x: 80, y: 80, width: 440, height: 340, radius: 0 } },
            { type: 'op_subtract', name: 'Inner Cutout', visible: true, locked: false, params: { shapeType: 'rect', x: 110, y: 110, width: 380, height: 280, radius: 0 } },
            { type: 'op_subtract', name: 'TL Corner', visible: true, locked: false, params: { shapeType: 'circle', x: 80, y: 80, radius: 20 } },
            { type: 'op_subtract', name: 'TR Corner', visible: true, locked: false, params: { shapeType: 'circle', x: 520, y: 80, radius: 20 } },
            { type: 'op_subtract', name: 'BL Corner', visible: true, locked: false, params: { shapeType: 'circle', x: 80, y: 420, radius: 20 } },
            { type: 'op_subtract', name: 'BR Corner', visible: true, locked: false, params: { shapeType: 'circle', x: 520, y: 420, radius: 20 } },
        ]
    },
    {
        id: 'speech-bubble',
        name: 'Speech Bubble',
        category: 'Decorative',
        description: 'Comic-style speech bubble',
        tags: ['bubble', 'chat', 'comic'],
        nodes: [
            { type: 'shape_rect', name: 'Bubble', visible: true, locked: false, params: { x: 120, y: 100, width: 300, height: 160, radius: 24 } },
            { type: 'op_union', name: 'Tail', visible: true, locked: false, params: { shapeType: 'circle', x: 160, y: 260, radius: 30 } },
            { type: 'op_subtract', name: 'Tail Cutout', visible: true, locked: false, params: { shapeType: 'circle', x: 190, y: 270, radius: 30 } },
        ]
    },
    {
        id: 'cloud-shape',
        name: 'Cloud',
        category: 'Decorative',
        description: 'Fluffy cloud shape',
        tags: ['cloud', 'weather', 'soft'],
        nodes: [
            { type: 'shape_circle', name: 'Center', visible: true, locked: false, params: { x: 280, y: 220, radius: 60 } },
            { type: 'op_union', name: 'Left', visible: true, locked: false, params: { shapeType: 'circle', x: 200, y: 240, radius: 45 } },
            { type: 'op_union', name: 'Right', visible: true, locked: false, params: { shapeType: 'circle', x: 360, y: 230, radius: 50 } },
            { type: 'op_union', name: 'Top', visible: true, locked: false, params: { shapeType: 'circle', x: 310, y: 170, radius: 40 } },
            { type: 'op_union', name: 'Bottom', visible: true, locked: false, params: { shapeType: 'rect', x: 180, y: 240, width: 200, height: 60, radius: 0 } },
        ]
    },
    {
        id: 'price-tag',
        name: 'Price Tag',
        category: 'Decorative',
        description: 'Shopping price tag',
        tags: ['price', 'tag', 'commerce'],
        nodes: [
            { type: 'shape_rect', name: 'Tag Body', visible: true, locked: false, params: { x: 150, y: 180, width: 200, height: 100, radius: 8 } },
            { type: 'op_union', name: 'Left Point', visible: true, locked: false, params: { shapeType: 'circle', x: 150, y: 230, radius: 50 } },
            { type: 'op_subtract', name: 'Hole', visible: true, locked: false, params: { shapeType: 'circle', x: 130, y: 230, radius: 12 } },
        ]
    },
    {
        id: 'banner-ribbon',
        name: 'Ribbon Banner',
        category: 'Decorative',
        description: 'Classic ribbon banner',
        tags: ['banner', 'ribbon', 'title'],
        nodes: [
            { type: 'shape_rect', name: 'Main Banner', visible: true, locked: false, params: { x: 100, y: 180, width: 400, height: 80, radius: 0 } },
            { type: 'op_union', name: 'Left Tail Top', visible: true, locked: false, params: { shapeType: 'rect', x: 60, y: 200, width: 60, height: 40, radius: 0 } },
            { type: 'op_union', name: 'Right Tail Top', visible: true, locked: false, params: { shapeType: 'rect', x: 480, y: 200, width: 60, height: 40, radius: 0 } },
            { type: 'op_subtract', name: 'Left Tail Notch', visible: true, locked: false, params: { shapeType: 'circle', x: 60, y: 220, radius: 20 } },
            { type: 'op_subtract', name: 'Right Tail Notch', visible: true, locked: false, params: { shapeType: 'circle', x: 540, y: 220, radius: 20 } },
        ]
    },
];

export function applyPreset(preset: Preset): OperationNode[] {
    return preset.nodes.map(node => ({
        ...node,
        id: uid()
    }));
}

export function getPresetsByCategory(): Record<string, Preset[]> {
    const result: Record<string, Preset[]> = {};
    for (const preset of PRESETS) {
        if (!result[preset.category]) {
            result[preset.category] = [];
        }
        result[preset.category].push(preset);
    }
    return result;
}

export function searchPresets(query: string): Preset[] {
    const q = query.toLowerCase().trim();
    if (!q) return PRESETS;
    return PRESETS.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    );
}
