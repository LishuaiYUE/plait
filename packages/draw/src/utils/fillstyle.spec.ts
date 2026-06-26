import { BOARD_TO_ROUGH_SVG, createTestingBoard, PlaitBoard, RectangleClient } from '@plait/core';
import { withDraw, PlaitGeometry, BasicShapes, drawGeometry, FlowchartSymbols, UMLSymbols } from '@plait/draw';
import { Options } from 'roughjs/bin/core';
import { GeometryShapeGenerator } from '../generators/geometry-shape.generator';

describe('fillStyle', () => {
    let board: PlaitBoard;

    beforeEach(() => {
        board = createTestingBoard([withDraw], []);
        BOARD_TO_ROUGH_SVG.set(board, createTestingRoughSVG());
    });

    const createTestingRoughSVG = () => {
        const createG = () => document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement;
        return {
            rectangle: () => createG(),
            path: () => createG()
        } as any;
    };

    describe('GeometryShapeGenerator', () => {
        it('should use solid fillStyle by default', () => {
            const roughSVG = PlaitBoard.getRoughSVG(board);
            const rectangleSpy = spyOn(roughSVG, 'rectangle').and.callThrough();
            const element: PlaitGeometry = {
                id: 'test-default-fill-style',
                type: 'geometry',
                shape: BasicShapes.rectangle,
                points: [
                    [0, 0],
                    [100, 100]
                ],
                fill: '#FF5733'
            };

            new GeometryShapeGenerator(board).draw(element, {});

            const options = rectangleSpy.calls.mostRecent().args[4] as Options;
            expect(options.fillStyle).toBe('solid');
        });

        it('should pass element fillStyle to shape engine', () => {
            const roughSVG = PlaitBoard.getRoughSVG(board);
            const rectangleSpy = spyOn(roughSVG, 'rectangle').and.callThrough();
            const element: PlaitGeometry = {
                id: 'test-custom-fill-style',
                type: 'geometry',
                shape: BasicShapes.rectangle,
                points: [
                    [0, 0],
                    [100, 100]
                ],
                fill: '#FF5733',
                fillStyle: 'hachure'
            };

            new GeometryShapeGenerator(board).draw(element, {});

            const options = rectangleSpy.calls.mostRecent().args[4] as Options;
            expect(options.fillStyle).toBe('hachure');
        });
    });

    describe('drawGeometry', () => {
        it('should preserve fillStyle for path based geometry engines', () => {
            const roughSVG = PlaitBoard.getRoughSVG(board);
            const pathSpy = spyOn(roughSVG, 'path').and.callThrough();
            const rectangle: RectangleClient = {
                x: 0,
                y: 0,
                width: 100,
                height: 100
            };

            const roughOptions: Options = {
                stroke: '#000000',
                strokeWidth: 2,
                fill: '#FF5733',
                fillStyle: 'hachure'
            };
            const shapes = [
                FlowchartSymbols.delay,
                FlowchartSymbols.predefinedProcess,
                UMLSymbols.activityClass,
                UMLSymbols.container,
                UMLSymbols.deletion
            ];

            shapes.forEach((shape) => {
                drawGeometry(board, rectangle, shape, roughOptions);
                const options = pathSpy.calls.mostRecent().args[1] as Options;
                expect(options.fillStyle).toBe('hachure');
            });
        });
    });
});
