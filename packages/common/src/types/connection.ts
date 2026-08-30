import { PlaitBoard, PlaitElement, Point, PointOfRectangle, RectangleClient, Vector } from '@plait/core';

/** Geometry used by line plugins without coupling them to a concrete element type. */
export interface ConnectionGeometry {
    rectangle: RectangleClient;
    connectorPoints: Point[];
    getNearestPoint: (point: Point) => Point;
    getVector: (connection: PointOfRectangle) => Vector;
}

export interface PlaitConnectionBoard extends PlaitBoard {
    getConnectionGeometry: (element: PlaitElement) => ConnectionGeometry | null;
}

export const isPlaitConnectionBoard = (board: PlaitBoard): board is PlaitConnectionBoard => {
    return typeof (board as PlaitConnectionBoard).getConnectionGeometry === 'function';
};
