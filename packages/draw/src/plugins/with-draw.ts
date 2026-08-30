import { PlaitBoard, PlaitElement, PlaitPluginElementContext, Point, RectangleClient, Selection, getSelectedElements } from '@plait/core';
import { GeometryComponent } from '../geometry.component';
import { ArrowLineComponent } from '../arrow-line.component';
import { VectorLineComponent } from '../vector-line.component';
import { PlaitDrawElement } from '../interfaces';
import { withDrawHotkey } from './with-draw-hotkey';
import { withGeometryCreateByDrawing, withGeometryCreateByDrag } from './with-geometry-create';
import { withDrawFragment } from './with-draw-fragment';
import { withArrowLineCreateByDraw } from './arrow-line/with-arrow-line-create';
import { withArrowLineResize } from './arrow-line/with-arrow-line-resize';
import { withArrowLineBoundReaction } from './arrow-line/with-arrow-line-bound-reaction';
import { withArrowLineText } from './arrow-line/with-arrow-line-text';
import { ImageComponent } from '../image.component';
import { withArrowLineAutoCompleteReaction } from './arrow-line/with-arrow-line-auto-complete-reaction';
import { withArrowLineAutoComplete } from './arrow-line/with-arrow-line-auto-complete';
import { withArrowLineTextMove } from './arrow-line/with-arrow-line-text-move';
import { withDrawResize } from './with-draw-resize';
import { getHitDrawElement, isHitDrawElement, isHitElementInside, isRectangleHitDrawElement } from '../utils/hit';
import { getArrowLinePoints, getArrowLineTextRectangle } from '../utils/arrow-line/arrow-line-basic';
import { withDrawRotate } from './with-draw-rotate';
import { withTable } from './with-table';
import { withSwimlane } from './with-swimlane';
import { withVectorLineCreateByDraw } from './with-vector-line-create';
import { getVectorLinePoints } from '../utils/vector-line';
import { withVectorLineResize } from './with-vector-line-resize';
import { PlaitConnectionBoard } from '@plait/common';
import { getNearestPoint } from '../utils/geometry';
import { getElementShape } from '../utils/shape';
import { getEngine } from '../engines';
import { getVectorByConnection } from '../utils/arrow-line/arrow-line-common';

export const withDraw = (board: PlaitBoard) => {
    const { drawElement, getRectangle, isRectangleHit, isHit, isInsidePoint, isMovable, isAlign, getRelatedFragment, getOneHitElement } =
        board;
    const connectionBoard = board as PlaitConnectionBoard;
    const getConnectionGeometry = connectionBoard.getConnectionGeometry?.bind(connectionBoard);

    connectionBoard.getConnectionGeometry = (element: PlaitElement) => {
        if (PlaitDrawElement.isShapeElement(element)) {
            const rectangle = RectangleClient.getRectangleByPoints(element.points);
            const engine = getEngine(getElementShape(element));
            return {
                rectangle,
                connectorPoints: engine.getConnectorPoints(rectangle),
                getNearestPoint: (point: Point) => getNearestPoint(element, point),
                getVector: (connection) => getVectorByConnection(element, connection)
            };
        }
        return getConnectionGeometry?.(element) ?? null;
    };

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitDrawElement.isGeometry(context.element)) {
            if (PlaitDrawElement.isUML(context.element)) {
                return GeometryComponent;
            }
            return GeometryComponent;
        } else if (PlaitDrawElement.isArrowLine(context.element)) {
            return ArrowLineComponent;
        } else if (PlaitDrawElement.isVectorLine(context.element)) {
            return VectorLineComponent;
        } else if (PlaitDrawElement.isImage(context.element)) {
            return ImageComponent;
        }
        return drawElement(context);
    };

    board.getRectangle = (element: PlaitElement) => {
        if (PlaitDrawElement.isGeometry(element)) {
            return RectangleClient.getRectangleByPoints(element.points);
        }
        if (PlaitDrawElement.isArrowLine(element)) {
            const points = getArrowLinePoints(board, element);
            const lineTextRectangles = element.texts.map((text, index) => {
                const rectangle = getArrowLineTextRectangle(board, element, index);
                return rectangle;
            });
            const linePointsRectangle = RectangleClient.getRectangleByPoints(points);
            return RectangleClient.getBoundingRectangle([linePointsRectangle, ...lineTextRectangles]);
        }
        if (PlaitDrawElement.isVectorLine(element)) {
            const points = getVectorLinePoints(board, element);
            const linePointsRectangle = RectangleClient.getRectangleByPoints(points!);
            return RectangleClient.getBoundingRectangle([linePointsRectangle]);
        }
        if (PlaitDrawElement.isImage(element)) {
            return RectangleClient.getRectangleByPoints(element.points);
        }
        return getRectangle(element);
    };

    board.isRectangleHit = (element: PlaitElement, selection: Selection) => {
        const result = isRectangleHitDrawElement(board, element, selection);
        if (result !== null) {
            return result;
        }
        return isRectangleHit(element, selection);
    };

    board.isHit = (element, point, isStrict?: boolean) => {
        const result = isHitDrawElement(board, element, point, isStrict);
        if (result !== null) {
            return result;
        }
        return isHit(element, point, isStrict);
    };

    board.getOneHitElement = (elements, hitPoint: Point) => {
        const isAllDrawElements = elements.every((item) => PlaitDrawElement.isDrawElement(item));
        if (isAllDrawElements) {
            return getHitDrawElement(board, elements as PlaitDrawElement[], hitPoint);
        }
        return getOneHitElement(elements, hitPoint);
    };

    board.isInsidePoint = (element: PlaitElement, point: Point) => {
        const result = isHitElementInside(board, element, point);
        if (result !== null) {
            return result;
        }
        return isInsidePoint(element, point);
    };

    board.isMovable = (element: PlaitElement) => {
        if (PlaitDrawElement.isGeometry(element)) {
            return true;
        }
        if (PlaitDrawElement.isImage(element)) {
            return true;
        }
        if (PlaitDrawElement.isVectorLine(element)) {
            return true;
        }
        if (PlaitDrawElement.isArrowLine(element)) {
            const selectedElements = getSelectedElements(board);
            const isSelected = (boundId: string) => {
                return !!selectedElements.find((value) => value.id === boundId);
            };
            if (!element.source.boundId && !element.target.boundId) {
                return true;
            }
            if (element.source.boundId && isSelected(element.source.boundId) && selectedElements.includes(element)) {
                return true;
            }
            if (element.target.boundId && isSelected(element.target.boundId) && selectedElements.includes(element)) {
                return true;
            }
            return false;
        }
        return isMovable(element);
    };

    board.isAlign = (element: PlaitElement) => {
        if (PlaitDrawElement.isGeometry(element) || PlaitDrawElement.isImage(element)) {
            return true;
        }
        return isAlign(element);
    };

    board.getRelatedFragment = (elements: PlaitElement[], originData?: PlaitElement[]) => {
        const selectedElements = originData?.length ? originData : getSelectedElements(board);
        const lineElements = board.children.filter((element) => PlaitDrawElement.isArrowLine(element));
        const activeLines = lineElements.filter((line) => {
            const source = selectedElements.find((element) => element.id === line.source.boundId);
            const target = selectedElements.find((element) => element.id === line.target.boundId);
            const isSelected = selectedElements.includes(line);
            return source && target && !isSelected;
        });
        return getRelatedFragment([...elements, ...activeLines], originData);
    };

    return withSwimlane(
        withTable(
            withDrawResize(
                withVectorLineCreateByDraw(
                    withArrowLineAutoCompleteReaction(
                        withArrowLineBoundReaction(
                            withVectorLineResize(
                                withArrowLineResize(
                                    withArrowLineTextMove(
                                        withArrowLineText(
                                            withDrawRotate(
                                                withArrowLineCreateByDraw(
                                                    withArrowLineAutoComplete(
                                                        withGeometryCreateByDrag(
                                                            withGeometryCreateByDrawing(withDrawFragment(withDrawHotkey(board)))
                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            )
        )
    );
};
