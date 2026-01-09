import { type StrokePoint } from '../store/project';

// Helper to calculate squared distance between point and line segment
function getSqSegDist(p: StrokePoint, p1: StrokePoint, p2: StrokePoint) {
    let x = p1.x, y = p1.y, dx = p2.x - x, dy = p2.y - y;
    if (dx !== 0 || dy !== 0) {
        const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
        if (t > 1) {
            x = p2.x;
            y = p2.y;
        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }
    dx = p.x - x;
    dy = p.y - y;
    return dx * dx + dy * dy;
}

// Ramer-Douglas-Peucker simplification
export function simplifyStroke(points: StrokePoint[], tolerance: number): StrokePoint[] {
    if (points.length <= 2) return points;

    const sqTolerance = tolerance * tolerance;
    let maxSqDist = 0;
    let index = 0;

    for (let i = 1; i < points.length - 1; i++) {
        const sqDist = getSqSegDist(points[i], points[0], points[points.length - 1]);
        if (sqDist > maxSqDist) {
            maxSqDist = sqDist;
            index = i;
        }
    }

    if (maxSqDist > sqTolerance) {
        const left = simplifyStroke(points.slice(0, index + 1), tolerance);
        const right = simplifyStroke(points.slice(index), tolerance);
        return [...left.slice(0, -1), ...right];
    }

    return [points[0], points[points.length - 1]];
}

// Chaikin's Corner Cutting Algorithm for smoothing
export function smoothStroke(points: StrokePoint[], iterations: number = 1): StrokePoint[] {
    if (points.length < 3 || iterations <= 0) return points;

    let current = points;
    for (let i = 0; i < iterations; i++) {
        const next: StrokePoint[] = [current[0]]; // Keep start
        for (let j = 0; j < current.length - 1; j++) {
            const p0 = current[j];
            const p1 = current[j + 1];

            // 25% and 75% points
            const q: StrokePoint = {
                x: 0.75 * p0.x + 0.25 * p1.x,
                y: 0.75 * p0.y + 0.25 * p1.y,
                pressure: 0.75 * p0.pressure + 0.25 * p1.pressure,
                time: p0.time + (p1.time - p0.time) * 0.25
            };
            const r: StrokePoint = {
                x: 0.25 * p0.x + 0.75 * p1.x,
                y: 0.25 * p0.y + 0.75 * p1.y,
                pressure: 0.25 * p0.pressure + 0.75 * p1.pressure,
                time: p0.time + (p1.time - p0.time) * 0.75
            };
            next.push(q, r);
        }
        next.push(current[current.length - 1]); // Keep end
        current = next;
    }
    return current;
}

// Resample points to be evenly spaced
export function resampleStroke(points: StrokePoint[], spacing: number): StrokePoint[] {
    if (points.length < 2) return points;

    const result: StrokePoint[] = [points[0]];
    let accumulated = 0;

    // Function to dist between two points
    // const dist = (p1, p2) => Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);

    for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        const d = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

        if (d + accumulated >= spacing) {
            const needed = spacing - accumulated;
            const ratio = needed / d;

            const newPt: StrokePoint = {
                x: p1.x + (p2.x - p1.x) * ratio,
                y: p1.y + (p2.y - p1.y) * ratio,
                pressure: p1.pressure + (p2.pressure - p1.pressure) * ratio,
                time: p1.time + (p2.time - p1.time) * ratio
            };

            result.push(newPt);
            accumulated = 0;
            // Backtrack to retry from new point (or just continue if d large? naive approach: break segment)
            // For simplicity in this iteration: simple linear walk
            // A more robust implementation handles multiple points per segment

            // To handle multiple points in one long segment:
            let remaining = d - needed;
            let currentP = newPt;
            while (remaining >= spacing) {
                // Re-calc from currentP is tricky with ratio/segment logic
                // Let's stick to simple "add one" for now or fix logic:

                // Better implementation:
                currentP = {
                    x: currentP.x + (p2.x - p1.x) * (spacing / d),
                    y: currentP.y + (p2.y - p1.y) * (spacing / d),
                    pressure: currentP.pressure, // approx
                    time: currentP.time
                };
                result.push(currentP);
                remaining -= spacing;
            }
            accumulated = remaining;
        } else {
            accumulated += d;
        }
    }

    // Always add last point
    if (result[result.length - 1] !== points[points.length - 1]) {
        result.push(points[points.length - 1]);
    }

    return result;
}

// Convert stroke to SVG path data
export function getSvgPathFromStroke(stroke: { points: { x: number, y: number }[] }): string {
    if (stroke.points.length < 2) return '';

    const { points } = stroke;
    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x} ${points[i].y}`;
    }

    return d;
}
