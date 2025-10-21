const text = {
    type: 'object',
    properties: {
        type: {
            type: 'string',
            enum: ['paragraph'],
            description: '文本类型'
        },
        children: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    text: {
                        type: 'string',
                        description: '文本内容'
                    }
                },
                required: ['text']
            },
            description: '文本数组'
        },
        align: {
            type: 'string',
            enum: ['left', 'center', 'right'],
            description: '对齐方式'
        }
    },
    required: ['type', 'children', 'align'],
    description: '文本'
};

const types = ['geometry', 'vector-line', 'arrow-line'];

const geometryShapes = [
    // ① BasicShapes
    'rectangle',
    'ellipse',
    'diamond',
    'roundRectangle',
    'parallelogram',
    'text',
    'triangle',
    'leftArrow',
    'trapezoid',
    'rightArrow',
    'cross',
    'star',
    'pentagon',
    'hexagon',
    'octagon',
    'pentagonArrow',
    'processArrow',
    'twoWayArrow',
    'comment',
    'roundComment',
    'cloud'

    // // ② FlowchartSymbols
    // 'process',
    // 'decision',
    // 'data',
    // 'connector',
    // 'terminal',
    // 'database',
    // 'hardDisk',
    // 'internalStorage',
    // 'manualInput',
    // 'preparation',
    // 'manualLoop',
    // 'merge',
    // 'delay',
    // 'storedData',
    // 'or',
    // 'summingJunction',
    // 'predefinedProcess',
    // 'offPage',
    // 'document',
    // 'multiDocument',
    // 'noteCurlyLeft',
    // 'noteCurlyRight',
    // 'noteSquare',
    // 'display',

    // // ③ UMLSymbols
    // 'actor',
    // 'useCase',
    // 'container',
    // 'note',
    // 'package',
    // 'combinedFragment',
    // 'class',
    // 'interface',
    // 'activation',
    // 'object',
    // 'deletion',
    // 'activityClass',
    // 'simpleClass',
    // 'component',
    // 'componentBox',
    // 'template',
    // 'port',
    // 'branchMerge',
    // 'assembly',
    // 'requiredInterface',
    // 'providedInterface',
];

const vectorLineShapes = ['straight', 'curve'];

const arrowLineShapes = ['straight', 'curve', 'elbow'];

export const geometrySchema = {
    type: 'object' as const,
    properties: {
        type: {
            type: 'string',
            enum: ['geometry']
        },
        points: {
            type: 'array',
            items: {
                type: 'array',
                items: { type: 'number' },
                minItems: 2,
                maxItems: 2
            },
            minItems: 2,
            maxItems: 2,
            description: '元素位置坐标，格式为 [[x1, y1], [x2, y2]]'
        },
        shape: {
            type: 'string',
            enum: geometryShapes,
            description: '形状'
        },
        text: text,
        angle: {
            type: 'number',
            description: '元素角度，0-360度'
        },
        fill: {
            type: 'string',
            pattern: '^#[0-9A-Fa-f]{6}$'
        },
        strokeColor: {
            type: 'string',
            pattern: '^#[0-9A-Fa-f]{6}$'
        },
        strokeWidth: {
            type: 'number',
            minimum: 1,
            description: '边框宽度，默认 2'
        },
        strokeStyle: {
            type: 'string',
            enum: ['solid', 'dashed', 'dotted']
        },
        opacity: {
            type: 'number',
            minimum: 0,
            maximum: 1
        }
    },
    required: ['type', 'points', 'shape', 'opacity', 'strokeWidth', 'text', 'angle']
};

export const vectorLineSchema = {
    type: 'object' as const,
    properties: {
        type: {
            type: 'string',
            enum: ['vector-line']
        },
        shape: {
            type: 'string',
            enum: vectorLineShapes
        },
        points: {
            type: 'array',
            items: {
                type: 'array',
                items: { type: 'number' },
                minItems: 2,
                maxItems: 2
            },
            minItems: 2,
            maxItems: 2
        },
        fill: {
            type: 'string',
            pattern: '^#[0-9A-Fa-f]{6}$'
        },
        strokeColor: {
            type: 'string',
            pattern: '^#[0-9A-Fa-f]{6}$'
        },
        strokeWidth: {
            type: 'number',
            minimum: 1,
            description: '边框宽度，默认 2'
        },
        strokeStyle: {
            type: 'string',
            enum: ['solid', 'dashed', 'dotted']
        },
        opacity: {
            type: 'number',
            minimum: 0,
            maximum: 1
        }
    },
    required: ['type', 'points', 'shape', 'opacity', 'strokeWidth']
};

export const arrowLineSchema = {
    type: 'object' as const,
    properties: {
        type: {
            type: 'string',
            enum: ['arrow-line']
        },
        shape: {
            type: 'string',
            enum: arrowLineShapes
        },
        points: {
            type: 'array',
            items: {
                type: 'array',
                items: { type: 'number' },
                minItems: 2,
                maxItems: 2
            },
            minItems: 2,
            maxItems: 2
        },
        source: {
            type: 'object',
            properties: {
                boundId: { type: 'string', description: '线的起始位置连着的元素的id，如果起点没有连着其它元素，则不填' },
                connection: {
                    type: 'array',
                    items: { type: 'number' },
                    minItems: 2,
                    maxItems: 2,
                    description: `该线条的起点连接元素的连接点，格式为 [x, y]， x 取值只能是 0 或 0.5 或 1， y 取值只能是 0 或 0.5 或 1，
                    [0,0] 表示起点连接元素的左上角，[0,1] 表示起点连接元素的左下角，[1,0] 表示起点连接元素的右上角，[1,1] 表示起点连接元素的右下角，
                    [0,0.5] 表示起点连接元素的左中，[1,0.5] 表示起点连接元素的右中，[0.5,0] 表示起点连接元素的上中，[0.5,1] 表示起点连接元素的下中，
                    当 boundId 有值时，必填。`
                },
                marker: {
                    type: 'string',
                    enum: [
                        'arrow',
                        'none',
                        'open-triangle',
                        'solid-triangle',
                        'sharp-arrow',
                        'one-side-up',
                        'one-side-down',
                        'hollow-triangle',
                        'single-slash'
                    ],
                    description: '箭头类型，默认 none'
                }
            },
            description: '线的起点，当 type 为 arrow-line 时必填'
        },
        target: {
            type: 'object',
            properties: {
                boundId: { type: 'string', description: '线的终点连着的元素的id，如果终点没有连着其它元素，则不填' },
                connection: {
                    type: 'array',
                    items: { type: 'number' },
                    minItems: 2,
                    maxItems: 2,
                    description: `该线条的终点连接元素的连接点，格式为 [x, y]， x 取值只能是 0 或 0.5 或 1， y 取值只能是 0 或 0.5 或 1，
                    [0,0] 表示终点连接元素的左上角，[0,1] 表示终点连接元素的左下角，[1,0] 表示终点连接元素的右上角，[1,1] 表示终点连接元素的右下角，
                    [0,0.5] 表示终点连接元素的左中，[1,0.5] 表示终点连接元素的右中，[0.5,0] 表示终点连接元素的上中，[0.5,1] 表示终点连接元素的下中，
                    当 boundId 有值时，必填。`
                },
                marker: {
                    type: 'string',
                    enum: [
                        'arrow',
                        'none',
                        'open-triangle',
                        'solid-triangle',
                        'sharp-arrow',
                        'one-side-up',
                        'one-side-down',
                        'hollow-triangle',
                        'single-slash'
                    ],
                    description: '箭头类型，默认arrow'
                }
            },
            description: '线的终点，当 type 为 arrow-line 时必填'
        },
        texts: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    text: text,
                    position: { type: 'number', description: 'Percentage of positioning based on line length.' }
                }
            },
            description: '文本。当 type 为 arrow-line 时可设置该属性。'
        },
        strokeColor: {
            type: 'string',
            pattern: '^#[0-9A-Fa-f]{6}$'
        },
        strokeWidth: {
            type: 'number',
            minimum: 1,
            description: '边框宽度，默认 2'
        },
        strokeStyle: {
            type: 'string',
            enum: ['solid', 'dashed', 'dotted']
        },
        opacity: {
            type: 'number',
            minimum: 0,
            maximum: 1
        }
    },
    required: ['type', 'points', 'shape', 'opacity', 'strokeWidth', 'source', 'target', 'texts']
};

export const requiredProperties = ['type', 'points', 'shape', 'opacity', 'strokeWidth'];

export const toolAuxiliaryPrompt = `
When creating diagrams with Plait MCP, follow these rules:
- Create elements one by one, not in batches. Connect blocks with arrows only after they exist.
- Text can only be drawn in geometry graphics. The basic text data structure is as follows:
\`\`\`json
    {
        "id": "BAeHJ",
        "type": "geometry",
        "shape": "rectangle",
        "angle": 0,
        "opacity": 1,
        "text": { "children": [{ "text": "吉祥" }], "type": "paragraph", "align": "center" },
        "points": [
            [-199.49609375, -270.15625],
            [-80.30078125, -224.546875]
        ],
        "strokeWidth": 2,
        "strokeColor": "#f08c02"
    }
\`\`\`

- When drawing arrows:
- Make sure they connect to the linked shape.
- If there is text on the line (vector-line or arrow-line), make sure the arrow is long enough to display the entire text.
- When creating a shape that contains a shape:
- Make sure the line is long enough to contain all the text.

- Supported element types: ${types.join(', ')}.

- The shape field has requirements:
- When the element type is geometry, the shape field value can only be one of ${geometryShapes.join(', ')}.
- When the element type is vector-line, the shape field value can only be one of ${vectorLineShapes.join(
    ', '
)}.Note that lines cannot overlap
- When the element type is arrow-line, the shape field value can only be one of ${arrowLineShapes.join(
    ', '
)}. Note that lines cannot overlap.

- When creating an element, the required fields vary depending on the element type:
- When the element type is geometry, the required fields are ${requiredProperties.join(', ')}, text, and angle.
- When the element type is vector-line, the required fields are ${requiredProperties.join(', ')}.
- When the element type is arrow-line, the required fields are ${requiredProperties.join(', ')}, source, target, and texts.
- Use macaron colors for the fill color of the graphic, and don’t use too dark a background color to avoid the text from being invisible.
- Guess required parameters based on the user's language; do not require the user to provide specific parameter values.
- Different elements should have different coordinates to prevent overlap.
- I hope the drawing will be more colorful and beautiful.
`;
