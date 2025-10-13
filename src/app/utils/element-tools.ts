import { PlaitBoard, PlaitElement, Point, Transforms } from '@plait/core';

/**
 * 创建元素
 */
export function createElement(
    board: PlaitBoard,
    type: string,
    position: Point,
    options: {
        width?: number;
        height?: number;
        fill?: string;
        strokeColor?: string;
        text?: string;
    } = {}
): PlaitElement {
    const { width = 100, height = 60, fill, strokeColor, text } = options;

    // 创建点坐标
    const points: [Point, Point] = [
        [position[0] - width / 2, position[1] - height / 2],
        [position[0] + width / 2, position[1] + height / 2]
    ];

    // 创建元素
    const element: PlaitElement = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        points,
        fill,
        strokeColor,
        ...(text && { text })
    };

    // 添加到画板
    Transforms.insertNode(board, element, [board.children.length]);

    return element;
}

/**
 * 更新元素
 */
export function updateElement(
    board: PlaitBoard,
    element: PlaitElement,
    updates: {
        position?: Point;
        width?: number;
        height?: number;
        fill?: string;
        strokeColor?: string;
        text?: string;
    }
): void {
    const path = PlaitBoard.findPath(board, element);
    if (!path) return;

    const properties: any = {};

    // 更新位置和尺寸
    if (updates.position || updates.width || updates.height) {
        const currentWidth = element.points ? element.points[1][0] - element.points[0][0] : 100;
        const currentHeight = element.points ? element.points[1][1] - element.points[0][1] : 60;

        const width = updates.width || currentWidth;
        const height = updates.height || currentHeight;
        const position = updates.position || [
            element.points ? (element.points[0][0] + element.points[1][0]) / 2 : 0,
            element.points ? (element.points[0][1] + element.points[1][1]) / 2 : 0
        ];

        properties.points = [
            [position[0] - width / 2, position[1] - height / 2],
            [position[0] + width / 2, position[1] + height / 2]
        ];
    }

    // 更新样式
    if (updates.fill !== undefined) properties.fill = updates.fill;
    if (updates.strokeColor !== undefined) properties.strokeColor = updates.strokeColor;
    if (updates.text !== undefined) properties.text = updates.text;

    // 应用更新
    if (Object.keys(properties).length > 0) {
        Transforms.setNode(board, properties, path);
    }
}

/**
 * 删除元素
 */
export function deleteElement(board: PlaitBoard, element: PlaitElement): void {
    const path = PlaitBoard.findPath(board, element);
    if (path) {
        Transforms.removeNode(board, path);
    }
}
