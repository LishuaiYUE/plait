import { PlaitBoard, Point, RectangleClient, rotatePoints, ResizeCursorClass } from '@plait/core';
import {
    RESIZE_HANDLE_DIAMETER,
    getRectangleResizeHandleRefs,
    getRotatedResizeCursorClassByAngle,
    ROTATE_HANDLE_SIZE,
    ROTATE_HANDLE_DISTANCE_TO_ELEMENT,
    ResizeHandle,
    isEdgeHandle
} from '@plait/common';

export interface ResizeHandleRef {
    rectangle: RectangleClient;
    handle: ResizeHandle;
    cursorClass: ResizeCursorClass;
}

export const getHitRectangleResizeHandleRef = (
    board: PlaitBoard,
    rectangle: RectangleClient,
    point: Point,
    angle: number = 0,
    isEdgeHandleOnly: boolean = false
): ResizeHandleRef | undefined => {
    const centerPoint = RectangleClient.getCenterPoint(rectangle);
    let resizeHandleRefs = getRectangleResizeHandleRefs(rectangle, RESIZE_HANDLE_DIAMETER);
    if (isEdgeHandleOnly) {
        resizeHandleRefs = resizeHandleRefs.filter((resizeHandleRef) => isEdgeHandle(board, resizeHandleRef.handle));
    }
    if (angle) {
        const rotatedPoint = rotatePoints([point], centerPoint, -angle)[0];
        let result = resizeHandleRefs.find((resizeHandleRef) => {
            return RectangleClient.isHit(RectangleClient.getRectangleByPoints([rotatedPoint, rotatedPoint]), resizeHandleRef.rectangle);
        });
        if (result) {
            result.cursorClass = getRotatedResizeCursorClassByAngle(result.cursorClass, angle);
        }
        return result;
    } else {
        return resizeHandleRefs.find((resizeHandleRef) => {
            return RectangleClient.isHit(RectangleClient.getRectangleByPoints([point, point]), resizeHandleRef.rectangle);
        });
    }
};

export const getRotateHandleRectangle = (rectangle: RectangleClient) => {
    return {
        x: rectangle.x - ROTATE_HANDLE_DISTANCE_TO_ELEMENT - ROTATE_HANDLE_SIZE,
        y: rectangle.y + rectangle.height + ROTATE_HANDLE_DISTANCE_TO_ELEMENT,
        width: ROTATE_HANDLE_SIZE,
        height: ROTATE_HANDLE_SIZE
    };
};
