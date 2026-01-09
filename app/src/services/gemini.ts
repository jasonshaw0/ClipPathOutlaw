import { GoogleGenerativeAI, type GenerateContentResult } from '@google/generative-ai';
import type { Stroke, OperationNode } from '../store/project';

const STORAGE_KEY = 'geminiApiKey';

export function getApiKey(): string | null {
    return localStorage.getItem(STORAGE_KEY);
}

export function setApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEY, key);
}

export function clearApiKey(): void {
    localStorage.removeItem(STORAGE_KEY);
}

// Serialize strokes to a compact format for the prompt
function serializeStrokes(strokes: Stroke[]): string {
    return strokes.map((stroke, i) => {
        const points = stroke.points.map(p => `(${Math.round(p.x)},${Math.round(p.y)})`).join(' ');
        return `Stroke ${i + 1}: ${points}`;
    }).join('\n');
}

const SYSTEM_PROMPT = `You are a geometric shape recognition AI for a CAD editor.
Analyze freehand stroke coordinate data and identify the intended geometric shapes.

Rules:
1. Return ONLY valid JSON array, no markdown, no explanation.
2. Each shape must have: type, name, params
3. types: "shape_rect", "shape_circle", "shape_polygon", "shape_star", "shape_custom"
4. For rect: params = { x, y, width, height, radius (corner) }
5. For circle: params = { x, y, radius }
6. For polygon: params = { x, y, radius, sides }
7. For star: params = { x, y, radius, points, innerRadius }
8. For irregular shapes use shape_custom with pathData (SVG path string)
9. Calculate bounding box center for x, y positions
10. Estimate dimensions from stroke extent

Example output:
[{"type":"shape_rect","name":"Rectangle","params":{"x":100,"y":100,"width":200,"height":150,"radius":0}}]
`;

export async function recognizeStrokes(strokes: Stroke[]): Promise<OperationNode[]> {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('No Gemini API key configured. Please set your API key in Settings.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const strokeData = serializeStrokes(strokes);
    const userPrompt = `Analyze these freehand strokes and return JSON array of detected shapes:\n\n${strokeData}`;

    const result: GenerateContentResult = await model.generateContent([
        { text: SYSTEM_PROMPT },
        { text: userPrompt }
    ]);

    const responseText = result.response.text();

    // Try to parse JSON from response (may be wrapped in markdown code block)
    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
    }

    let shapes: Array<{ type: string; name: string; params: Record<string, unknown> }>;
    try {
        shapes = JSON.parse(jsonStr);
    } catch {
        console.error('Failed to parse AI response:', responseText);
        throw new Error('AI returned invalid JSON. Falling back to manual bake.');
    }

    if (!Array.isArray(shapes)) {
        throw new Error('AI did not return an array of shapes.');
    }

    // Convert to OperationNodes
    const nodes: OperationNode[] = shapes.map((shape, i) => ({
        id: crypto.randomUUID(),
        type: shape.type as OperationNode['type'],
        name: shape.name || `Shape ${i + 1}`,
        visible: true,
        locked: false,
        params: shape.params || {}
    }));

    return nodes;
}
