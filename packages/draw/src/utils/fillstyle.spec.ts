import { createTestingBoard, PlaitBoard, RectangleClient } from '@plait/core';
import { withDraw, PlaitGeometry, BasicShapes, drawGeometry, FillStyle } from '@plait/draw';
import { Options } from 'roughjs/bin/core';

describe('fillStyle', () => {
    let board: PlaitBoard;

    beforeEach(() => {
        board = createTestingBoard([withDraw], []);
    });

    describe('PlaitCommonGeometry interface', () => {
        it('should accept fillStyle property on geometry elements', () => {
            const element: PlaitGeometry = {
                id: 'test-1',
                type: 'geometry',
                shape: BasicShapes.rectangle,
                points: [
                    [0, 0],
                    [100, 100]
                ],
                fill: '#FF5733',
                fillStyle: 'hachure',
                strokeColor: '#000000',
                strokeWidth: 2
            };

            expect(element.fillStyle).toBe('hachure');
        });

        it('should allow all rough.js fill styles', () => {
            const fillStyles: FillStyle[] = [
                'solid',
                'hachure',
                'zigzag',
                'cross-hatch',
                'dots',
                'dashed',
                'zigzag-line'
            ];

            fillStyles.forEach((fillStyle) => {
                const element: PlaitGeometry = {
                    id: `test-${fillStyle}`,
                    type: 'geometry',
                    shape: BasicShapes.rectangle,
                    points: [
                        [0, 0],
                        [100, 100]
                    ],
                    fillStyle
                };

                expect(element.fillStyle).toBe(fillStyle);
            });
        });

        it('should make fillStyle optional', () => {
            const element: PlaitGeometry = {
                id: 'test-optional',
                type: 'geometry',
                shape: BasicShapes.rectangle,
                points: [
                    [0, 0],
                    [100, 100]
                ]
            };

            expect(element.fillStyle).toBeUndefined();
        });
    });

    describe('drawGeometry', () => {
        it('should pass fillStyle to shape engine', () => {
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

            const result = drawGeometry(board, rectangle, BasicShapes.rectangle, roughOptions);
            
            expect(result).toBeDefined();
            expect(result instanceof SVGGElement).toBe(true);
        });
    });
});
