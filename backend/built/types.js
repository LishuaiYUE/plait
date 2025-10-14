export const elementTypes = ['text', 'rectangle', 'ellipse', 'diamond', 'triangle', 'arrow', 'line', 'freedraw', 'image', 'video', 'audio', 'file', 'sticker', 'text_box', 'code_block', 'shape', 'link', 'frame', 'table', 'chart', 'mindmap', 'flowchart', 'sequence_diagram', 'class_diagram', 'state_di'];
export const elements = new Map();
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
//# sourceMappingURL=types.js.map