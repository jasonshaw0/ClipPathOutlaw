import paper from 'paper';
import type { OperationNode } from '../store/project';

// Initialize a headless scope for calculations
const scope = new paper.PaperScope();
scope.setup(new paper.Size(2000, 2000));

export function evaluateStack(stack: OperationNode[]): string {
    let currentPath: paper.PathItem | null = null;
    const activeNodes = stack.filter(n => n.visible !== false);

    if (activeNodes.length === 0) return '';

    activeNodes.forEach(node => {
        const item = processNode(node, currentPath);
        if (item && item !== currentPath) {
            currentPath = item;
        }
    });

    if (!currentPath) return '';

    const finalPath = currentPath as paper.Path;
    const svg = finalPath.exportSVG({ asString: true }) as string;
    const match = svg.match(/d="([^"]+)"/);
    const pathData = match ? match[1] : '';

    finalPath.remove();
    scope.project.activeLayer.removeChildren();

    return pathData;
}

function processNode(node: OperationNode, prev: paper.PathItem | null): paper.PathItem | null {
    switch (node.type) {
        case 'shape_rect': {
            const { x, y, width, height, radius } = node.params;
            return new paper.Path.Rectangle(
                new paper.Rectangle(x, y, width, height),
                new paper.Size(radius || 0, radius || 0)
            );
        }
        case 'shape_circle': {
            const { x, y, radius } = node.params;
            return new paper.Path.Circle(new paper.Point(x, y), radius);
        }
        case 'shape_polygon': {
            const { x, y, radius, sides = 6 } = node.params;
            return new paper.Path.RegularPolygon(
                new paper.Point(x, y),
                sides,
                radius
            );
        }
        case 'shape_star': {
            const { x, y, radius, points = 5, innerRadius } = node.params;
            return new paper.Path.Star(
                new paper.Point(x, y),
                points,
                innerRadius || radius * 0.4,
                radius
            );
        }
        case 'shape_custom': {
            const { pathData } = node.params;
            if (!pathData) return prev;
            try {
                return new paper.Path(pathData);
            } catch {
                return prev;
            }
        }
        case 'op_subtract': {
            if (!prev) return null;
            const cutter = createShapeFromParams(node.params);
            if (!cutter) return prev;
            return prev.subtract(cutter);
        }
        case 'op_union': {
            if (!prev) return null;
            const adder = createShapeFromParams(node.params);
            if (!adder) return prev;
            return prev.unite(adder);
        }
        case 'op_intersect': {
            if (!prev) return null;
            const intersector = createShapeFromParams(node.params);
            if (!intersector) return prev;
            return prev.intersect(intersector);
        }
        case 'op_xor': {
            if (!prev) return null;
            const excluder = createShapeFromParams(node.params);
            if (!excluder) return prev;
            return prev.exclude(excluder);
        }
        case 'mod_offset': {
            // Paper.js doesn't have robust offset - placeholder
            return prev;
        }
        case 'mod_fillet': {
            // Custom corner logic - placeholder
            return prev;
        }
        case 'mod_smooth': {
            if (!prev) return null;
            // Apply smoothing
            const path = prev as paper.Path;
            if (path.smooth) {
                path.smooth({ type: 'continuous' });
            }
            return path;
        }
        default:
            return prev;
    }
}

function createShapeFromParams(params: Record<string, unknown>): paper.PathItem | null {
    const shapeType = params.shapeType as string;
    const x = params.x as number;
    const y = params.y as number;
    const radius = params.radius as number;

    if (shapeType === 'circle') {
        return new paper.Path.Circle(new paper.Point(x, y), radius);
    }
    if (shapeType === 'rect') {
        const width = params.width as number;
        const height = params.height as number;
        const cornerRadius = (params.cornerRadius as number) || 0;
        return new paper.Path.Rectangle(
            new paper.Rectangle(x, y, width, height),
            new paper.Size(cornerRadius, cornerRadius)
        );
    }
    if (shapeType === 'polygon') {
        const sides = (params.sides as number) || 6;
        return new paper.Path.RegularPolygon(new paper.Point(x, y), sides, radius);
    }
    if (shapeType === 'star') {
        const points = (params.points as number) || 5;
        const innerRadius = (params.innerRadius as number) || radius * 0.4;
        return new paper.Path.Star(new paper.Point(x, y), points, innerRadius, radius);
    }
    return null;
}
