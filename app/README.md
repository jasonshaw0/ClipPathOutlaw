# Shape Designer

A powerful visual shape editor for creating complex SVG shapes through boolean operations, modifiers, and layer-based styling. Build everything from simple cards to intricate UI components with precise control.

![Shape Designer](https://img.shields.io/badge/React-19.2-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![Vite](https://img.shields.io/badge/Vite-7.2-purple)

## Features

✨ **Boolean Operations** - Combine shapes with union, subtract, intersect, and XOR operations  
🎨 **Layer-Based Styling** - Apply fills, strokes, shadows, glows, gradients, and patterns with blend modes  
📐 **Interactive Handles** - Drag handles to adjust position, size, radius, and shape-specific parameters  
🎯 **38 Built-in Presets** - Ready-to-use shapes including cards, buttons, badges, tabs, panels, and decorative elements  
🔧 **Geometry Engine** - Powered by Paper.js for precise boolean operations  
📱 **Responsive Canvas** - Pan (Alt+drag), zoom (Ctrl+wheel), and grid snapping  
🎭 **Advanced Effects** - Inner/outer glow, noise, patterns, technical blueprints, and more  
📦 **Export Ready** - Generate clean SVG output for use anywhere

## Tech Stack

- **React 19.2** + **TypeScript** - Modern UI framework
- **Vite 7.2** - Lightning-fast build tool
- **Zustand 5.0** - Lightweight state management
- **Paper.js 0.12** - Computational geometry engine
- **Lucide React** - Beautiful icon library
- **CSS-in-JS** - Inline styling with CSS variables

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

### Build

```bash
npm run build
```

Outputs to `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── core/              # Core geometry and pattern logic
│   ├── geometry.ts    # Paper.js shape evaluation
│   ├── patterns.ts    # Pattern generation
│   └── presets.ts     # 38 shape presets
├── store/             # Zustand state stores
│   ├── project.ts     # Operation stack and selection
│   └── layers.ts      # Style layers and blend modes
├── components/        # React components
│   ├── canvas/        # SVG rendering and handles
│   ├── layout/        # Grid layout system
│   └── panels/        # UI panels (sidebar, inspector, etc.)
├── styles/            # CSS variables and base styles
├── App.tsx            # Root component
└── main.tsx           # Entry point
```

## Key Concepts

### Operations Stack

Shapes are created by stacking operations sequentially:

1. **Base Shapes**: Rectangle, Circle, Polygon, Star, Custom
2. **Boolean Ops**: Union, Subtract, Intersect, XOR
3. **Modifiers**: Offset, Fillet, Smooth

Each operation node contains:
- `type`: Operation type (shape_rect, op_subtract, etc.)
- `params`: Shape-specific parameters (x, y, width, radius, etc.)
- `visible`, `locked`: Visibility and edit protection
- `children`: Optional nested operations

### Style Layers

Apply multiple visual effects with layer-based styling:

- **Fill**: Solid colors
- **Stroke**: Borders with dash patterns
- **Inset Border**: Inner borders
- **Shadow**: Drop shadows with offset and blur
- **Inner/Outer Glow**: Glowing effects
- **Gradient**: Linear gradients with angle control
- **Pattern**: Technical patterns (dots, lines, rivets, etc.)
- **Noise**: Procedural texture

Each layer supports:
- Opacity control
- Blend modes (multiply, screen, overlay, etc.)
- Offset positioning
- Show/hide toggle

### Interactive Handles

Selected shapes show interactive handles:

- 🔵 **Position**: Drag center to move
- 🔵 **Resize**: Drag corners/edges to scale
- 🟢 **Radius**: Adjust corner radius (rectangles)
- 🟠 **Edge Slide**: Constrained edge movement
- 🟣 **Distance**: Parameter-specific adjustments
- 🩷 **Rotation**: Rotate shapes

Hold **Shift** while dragging for axis-constrained movement.

## Built-in Presets

38 presets organized by category:

**Cards**: Standard, Rounded, Notched, Tickets, Phone Notch, Dynamic Island  
**Buttons**: Rounded, Pill, Notched, Split, Merged  
**Badges**: Rounded, Pill, Hexagon, Cut Corner, Folded Corner  
**Tabs**: Rounded, Slanted, Wave  
**Panels**: Card with Header, Split Panel, Control Panel, Segmented Control  
**Complex**: Phone Frame, Gamepad, Badge Stack, Layered Badge, Tag Cluster  
**Decorative**: Speech Bubble, Cloud, Flower, Gear, Burst, Cog, Puzzle Piece

## Keyboard Shortcuts

- **Alt + Drag**: Pan canvas
- **Ctrl + Wheel**: Zoom in/out
- **Shift + Drag Handle**: Constrain to axis
- **Delete**: Remove selected node

## Data Flow

1. User adds operation → Updates stack in `useProjectStore`
2. Stack changes → `evaluateStack()` computes geometry with Paper.js
3. Geometry + layers → Canvas renders SVG with effects
4. User selects node → Handles overlay appears
5. User drags handle → Updates node parameters → Re-renders
6. User applies preset → Multiple operations added to stack

## Architecture Highlights

- **Headless Paper.js**: 2000x2000 scope for geometry computation
- **No Backend**: Fully client-side, no API calls
- **Sequential Evaluation**: Operations processed in order
- **SVG Rendering**: Native SVG for all visual output
- **Ref-based Handles**: Minimizes re-renders during drag
- **CSS Variables**: Consistent theming throughout

## Customization

### Adding Custom Shapes

Edit `src/core/geometry.ts` to add new shape types.

### Creating Patterns

Edit `src/core/patterns.ts` to define new pattern generators.

### New Layer Types

Extend `src/store/layers.ts` with additional style layer types.

## Performance

- Sequential geometry evaluation limits complexity at high node counts
- Handle dragging uses refs to prevent render storms
- Canvas operations debounced during pan/zoom
- SVG filters cached by browser

## Browser Support

Modern browsers with SVG 1.1 and ES2020+ support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

This is a personal project, but suggestions and bug reports are welcome via issues.

## License

MIT

## Acknowledgments

- **Paper.js** - Powerful vector graphics library
- **React Team** - Incredible framework and tools
- **Lucide** - Beautiful icon set
- **Vite Team** - Amazing DX
