import {
    Direction,
    PlaitBoard,
    PlaitElement,
    Point,
    PointOfRectangle,
    RectangleClient,
    Vector,
    getElementById,
    rotatePointsByElement
} from '@plait/core';
import { Element } from 'slate';
import { StrokeStyle } from '@plait/common';
import { PlaitConnectionBoard } from '@plait/common';

export enum ArrowLineMarkerType {
    arrow = 'arrow',
    none = 'none',
    openTriangle = 'open-triangle',
    solidTriangle = 'solid-triangle',
    sharpArrow = 'sharp-arrow',
    oneSideUp = 'one-side-up',
    oneSideDown = 'one-side-down',
    hollowTriangle = 'hollow-triangle',
    singleSlash = 'single-slash'
}

export enum ArrowLineShape {
    straight = 'straight',
    curve = 'curve',
    elbow = 'elbow'
}

export enum ArrowLineHandleKey {
    source = 'source',
    target = 'target'
}

export interface ArrowLineText {
    text: Element;
    // Percentage of positioning based on line length
    position: number;
}

export interface ArrowLineHandle {
    // The id of the bounded element
    boundId?: string;
    connection?: PointOfRectangle;
    marker: ArrowLineMarkerType;
}

export interface ArrowLineHandleRef {
    key: ArrowLineHandleKey;
    direction: Direction;
    point: PointOfRectangle;
    vector: Vector;
    boundElement?: PlaitElement;
}

export interface ArrowLineHandleRefPair {
    source: ArrowLineHandleRef;
    target: ArrowLineHandleRef;
}

export interface PlaitArrowLine extends PlaitElement {
    type: 'arrow-line';
    shape: ArrowLineShape;
    points: Point[];

    source: ArrowLineHandle;
    target: ArrowLineHandle;

    texts: ArrowLineText[];

    // node style attributes
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: StrokeStyle;

    opacity: number;
}

export interface PlaitStraightArrowLine extends PlaitArrowLine {
    shape: ArrowLineShape.straight;
}

export interface PlaitCurveArrowLine extends PlaitArrowLine {
    shape: ArrowLineShape.curve;
}

export interface PlaitElbowArrowLine extends PlaitArrowLine {
    shape: ArrowLineShape.elbow;
}

export const PlaitArrowLine = {
    isSourceMarkOrTargetMark(line: PlaitArrowLine, markType: ArrowLineMarkerType, handleKey: ArrowLineHandleKey) {
        if (handleKey === ArrowLineHandleKey.source) {
            return line.source.marker === markType;
        } else {
            return line.target.marker === markType;
        }
    },
    isSourceMark(line: PlaitArrowLine, markType: ArrowLineMarkerType) {
        return PlaitArrowLine.isSourceMarkOrTargetMark(line, markType, ArrowLineHandleKey.source);
    },
    isTargetMark(line: PlaitArrowLine, markType: ArrowLineMarkerType) {
        return PlaitArrowLine.isSourceMarkOrTargetMark(line, markType, ArrowLineHandleKey.target);
    },
    isBoundElementOfSource(line: PlaitArrowLine, element: PlaitElement) {
        return line.source.boundId === element.id;
    },
    isBoundElementOfTarget(line: PlaitArrowLine, element: PlaitElement) {
        return line.target.boundId === element.id;
    },
    getPoints(board: PlaitBoard, line: PlaitArrowLine) {
        let sourcePoint;
        if (line.source.boundId) {
            const sourceElement = getElementById<PlaitElement>(board, line.source.boundId)!;
            const sourceRectangle = (board as PlaitConnectionBoard).getConnectionGeometry(sourceElement)!.rectangle;
            const sourceConnectionPoint = RectangleClient.getConnectionPoint(sourceRectangle, line.source.connection!);
            sourcePoint = rotatePointsByElement(sourceConnectionPoint, sourceElement) || sourceConnectionPoint;
        } else {
            sourcePoint = line.points[0];
        }

        let targetPoint;
        if (line.target.boundId) {
            const targetElement = getElementById<PlaitElement>(board, line.target.boundId)!;
            const targetRectangle = (board as PlaitConnectionBoard).getConnectionGeometry(targetElement)!.rectangle;
            const targetConnectionPoint = RectangleClient.getConnectionPoint(targetRectangle, line.target.connection!);
            targetPoint = rotatePointsByElement(targetConnectionPoint, targetElement) || targetConnectionPoint;
        } else {
            targetPoint = line.points[line.points.length - 1];
        }
        const restPoints = line.points.length > 2 ? line.points.slice(1, line.points.length - 1) : [];
        return [sourcePoint, ...restPoints, targetPoint];
    }
};
