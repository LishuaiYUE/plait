import { PlaitBoard, Point, RectangleClient, createG, toHostPoint, toViewBoxPoint } from '@plait/core';
import { PlaitTable, PlaitTableBoard, TableSymbols } from '../interfaces';
import { createDefaultTable, getDefaultTablePoints, insertElement } from '../utils';
import {
    normalizeShapePoints,
    isDndMode,
    isDrawingMode,
    getDirectionFactorByDirectionComponent,
    getUnitVectorByPointAndPoint,
    TextManage
} from '@plait/common';
import { isKeyHotkey } from 'is-hotkey';
import { getSnapResizingRef } from '../utils/snap-resizing';
import { TableGenerator } from '../generators/table.generator';

export interface FakeCreateTextRef {
    g: SVGGElement;
    textManage: TextManage;
}

const isTableDndMode = (board: PlaitBoard) => {
    const isTablePointer = PlaitBoard.isPointer(board, TableSymbols.table);
    const dndMode = isTablePointer && isDndMode(board);
    return dndMode;
};

const isTableDrawingMode = (board: PlaitTableBoard) => {
    const isTablePointer = PlaitBoard.isPointer(board, TableSymbols.table);
    const drawingMode = isTablePointer && isDrawingMode(board);
    return drawingMode;
};

export const withTableCreateByDrag = (board: PlaitTableBoard) => {
    const { pointerMove, globalPointerUp, pointerUp } = board;

    let tableG: SVGGElement | null = null;

    let temporaryElement: PlaitTable | null = null;

    board.pointerMove = (event: PointerEvent) => {
        tableG?.remove();
        tableG = createG();
        const tableGenerator = new TableGenerator(board);
        const dragMode = isTableDndMode(board);
        const movingPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));

        if (dragMode) {
            const points = getDefaultTablePoints(movingPoint);
            temporaryElement = createDefaultTable(points);
            tableGenerator.processDrawing(temporaryElement, tableG);
            PlaitBoard.getElementTopHost(board).append(tableG);
        }

        pointerMove(event);
    };

    board.pointerUp = (event: PointerEvent) => {
        if (isTableDndMode(board) && temporaryElement) {
            return;
        }
        pointerUp(event);
    };

    board.globalPointerUp = (event: PointerEvent) => {
        if (isTableDndMode(board) && temporaryElement) {
            insertElement(board, temporaryElement);
        }
        temporaryElement = null;
        tableG?.remove();
        tableG = null;
        globalPointerUp(event);
    };

    return board;
};

export const withTableCreateByDrawing = (board: PlaitTableBoard) => {
    const { pointerDown, pointerMove, pointerUp, keyDown, keyUp } = board;
    let start: Point | null = null;

    let swimlaneG: SVGGElement | null = null;

    let temporaryElement: PlaitTable | null = null;

    let isShift = false;

    let snapG: SVGGElement | null;

    board.keyDown = (event: KeyboardEvent) => {
        isShift = isKeyHotkey('shift', event);
        keyDown(event);
    };

    board.keyUp = (event: KeyboardEvent) => {
        isShift = false;
        keyUp(event);
    };

    board.pointerDown = (event: PointerEvent) => {
        if (!PlaitBoard.isReadonly(board) && isTableDrawingMode(board)) {
            const point = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            start = point;
        }
        pointerDown(event);
    };

    board.pointerMove = (event: PointerEvent) => {
        swimlaneG?.remove();
        swimlaneG = createG();
        const tableGenerator = new TableGenerator(board);
        const movingPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
        snapG?.remove();
        if (start && isTableDrawingMode(board)) {
            let points: [Point, Point] = normalizeShapePoints([start, movingPoint], isShift);
            const activeRectangle = RectangleClient.getRectangleByPoints(points);
            const [x, y] = getUnitVectorByPointAndPoint(start, movingPoint);
            const resizeSnapRef = getSnapResizingRef(board, [], {
                resizePoints: points,
                activeRectangle,
                directionFactors: [getDirectionFactorByDirectionComponent(x), getDirectionFactorByDirectionComponent(y)],
                isAspectRatio: isShift,
                isFromCorner: true,
                isCreate: true
            });
            snapG = resizeSnapRef.snapG;
            PlaitBoard.getElementTopHost(board).append(snapG);
            points = normalizeShapePoints(resizeSnapRef.activePoints as [Point, Point], isShift);
            temporaryElement = createDefaultTable(points);
            tableGenerator.processDrawing(temporaryElement, swimlaneG);
            PlaitBoard.getElementTopHost(board).append(swimlaneG);
        }
        pointerMove(event);
    };

    board.pointerUp = (event: PointerEvent) => {
        if (isTableDrawingMode(board) && start) {
            const targetPoint = toViewBoxPoint(board, toHostPoint(board, event.x, event.y));
            const { width, height } = RectangleClient.getRectangleByPoints([start!, targetPoint]);
            if (Math.hypot(width, height) < 8) {
                const points = getDefaultTablePoints(targetPoint);
                temporaryElement = createDefaultTable(points);
            }
            if (temporaryElement) {
                insertElement(board, temporaryElement);
            }
            snapG?.remove();
            swimlaneG?.remove();
            swimlaneG = null;
            start = null;
            temporaryElement = null;
            return;
        }
        pointerUp(event);
    };
    return board;
};
