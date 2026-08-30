import {
    PlaitBoard,
    PlaitPluginElementContext,
    OnContextChanged,
    getElementById,
    createDebugGenerator,
    PlaitNode,
    PlaitElement,
    Point
} from '@plait/core';
import { ArrowLineText, PlaitArrowLine } from './interfaces';
import { LineActiveGenerator } from './generators/line-active.generator';
import { DrawTransforms } from './transforms';
import { GeometryThreshold, MIN_TEXT_WIDTH } from './constants';
import { CommonElementFlavour, TextManage, TextManageChangeData } from '@plait/common';
import { getArrowLineTextRectangle } from './utils/arrow-line/arrow-line-basic';
import { memorizeLatestText } from './utils/memorize';
import { ArrowLineShapeGenerator } from './generators/arrow-line.generator';
import { getArrowLinePoints } from './utils';

interface BoundedElements {
    source?: PlaitElement;
    target?: PlaitElement;
}

const debugKey = 'debug:plait:line-turning';
const debugGenerator = createDebugGenerator(debugKey);

export class ArrowLineComponent
    extends CommonElementFlavour<PlaitArrowLine, PlaitBoard>
    implements OnContextChanged<PlaitArrowLine, PlaitBoard>
{
    shapeGenerator!: ArrowLineShapeGenerator;

    activeGenerator!: LineActiveGenerator;

    boundedElements: BoundedElements = {};

    private lastLinePoints: Point[] = [];

    private hasDrawn = false;

    constructor() {
        super();
    }

    initializeGenerator() {
        this.shapeGenerator = new ArrowLineShapeGenerator(this.board);
        this.activeGenerator = new LineActiveGenerator(this.board);
        this.initializeTextManages();
    }

    initialize(): void {
        this.initializeGenerator();
        if (this.board.isVisible(this.element)) {
            this.drawLine();
        }
        super.initialize();
        this.boundedElements = this.getBoundedElements();
        if (this.hasDrawn) {
            this.drawText();
        }
        this.getRef().updateActiveSection = () => {
            if (!this.board.isVisible(this.element)) {
                return;
            }
            const linePoints = getArrowLinePoints(this.board, this.element);
            this.activeGenerator.processDrawing(this.element, PlaitBoard.getActiveHost(this.board), {
                selected: this.selected,
                linePoints
            });
        };
        debugGenerator.isDebug() && debugGenerator.drawCircles(this.board, this.element.points.slice(1, -1), 4, true);
    }

    getBoundedElements() {
        const boundedElements: BoundedElements = {};
        if (this.element.source.boundId) {
            const boundElement = getElementById<PlaitElement>(this.board, this.element.source.boundId);
            if (boundElement) {
                boundedElements.source = boundElement;
            }
        }
        if (this.element.target.boundId) {
            const boundElement = getElementById<PlaitElement>(this.board, this.element.target.boundId);
            if (boundElement) {
                boundedElements.target = boundElement;
            }
        }
        return boundedElements;
    }

    onContextChanged(
        value: PlaitPluginElementContext<PlaitArrowLine, PlaitBoard>,
        previous: PlaitPluginElementContext<PlaitArrowLine, PlaitBoard>
    ) {
        if (!this.board.isVisible(this.element)) {
            return;
        }
        if (!this.hasDrawn) {
            this.drawLine(true);
            return;
        }
        const boundedElements = this.getBoundedElements();
        const isBoundedElementsChanged =
            boundedElements.source !== this.boundedElements.source || boundedElements.target !== this.boundedElements.target;
        this.boundedElements = boundedElements;
        const linePoints = getArrowLinePoints(this.board, this.element);
        const areLinePointsChanged = JSON.stringify(linePoints) !== JSON.stringify(this.lastLinePoints);
        this.lastLinePoints = linePoints;
        if (value.element !== previous.element || value.hasThemeChanged) {
            this.shapeGenerator.processDrawing(this.element, this.getElementG());
            this.activeGenerator.processDrawing(this.element, PlaitBoard.getActiveHost(this.board), {
                selected: this.selected,
                linePoints
            });
            this.updateText(previous.element.texts, value.element.texts);
            this.updateTextRectangle();
        } else {
            const needUpdate = value.selected !== previous.selected || this.activeGenerator.needUpdate();
            if (needUpdate || value.selected) {
                this.activeGenerator.processDrawing(this.element, PlaitBoard.getActiveHost(this.board), {
                    selected: this.selected,
                    linePoints
                });
            }
        }
        if (isBoundedElementsChanged || areLinePointsChanged) {
            this.shapeGenerator.processDrawing(this.element, this.getElementG());
            this.activeGenerator.processDrawing(this.element, PlaitBoard.getActiveHost(this.board), {
                selected: this.selected,
                linePoints
            });
            this.updateTextRectangle();
            return;
        }
    }

    private drawLine(drawText = false) {
        this.shapeGenerator.processDrawing(this.element, this.getElementG());
        const linePoints = getArrowLinePoints(this.board, this.element);
        this.lastLinePoints = linePoints;
        this.activeGenerator.processDrawing(this.element, PlaitBoard.getActiveHost(this.board), {
            selected: this.selected,
            linePoints
        });
        if (drawText) {
            this.drawText();
        }
        this.hasDrawn = true;
    }

    initializeTextManages() {
        if (this.element.texts?.length) {
            const textManages: TextManage[] = [];
            this.element.texts.forEach((text: ArrowLineText, index: number) => {
                const manage = this.createTextManage(text, index);
                textManages.push(manage);
            });
            this.getRef().initializeTextManage(textManages);
        }
    }

    drawText() {
        if (this.element.texts?.length) {
            this.getRef()
                .getTextManages()
                .forEach((manage, index) => {
                    manage.draw(this.element.texts![index].text);
                    this.getElementG().append(manage.g);
                });
        }
    }

    createTextManage(text: ArrowLineText, index: number) {
        return new TextManage(this.board, {
            getRectangle: () => {
                return getArrowLineTextRectangle(this.board, this.element as PlaitArrowLine, index);
            },
            onChange: (textManageChangeData: TextManageChangeData) => {
                const path = PlaitBoard.findPath(this.board, this.element);
                const node = PlaitNode.get(this.board, path) as PlaitArrowLine;
                const texts = [...node.texts];
                // const newWidth = textManageChangeData.width < MIN_TEXT_WIDTH ? MIN_TEXT_WIDTH : textManageChangeData.width;
                texts.splice(index, 1, {
                    text: textManageChangeData.newText ? textManageChangeData.newText : this.element.texts[index].text,
                    position: this.element.texts[index].position
                });
                DrawTransforms.setArrowLineTexts(this.board, this.element as PlaitArrowLine, texts);
                textManageChangeData.operations && memorizeLatestText(this.element, textManageChangeData.operations);
            },
            getMaxWidth: () => GeometryThreshold.defaultTextMaxWidth,
            textPlugins: []
        });
    }

    updateText(previousTexts: ArrowLineText[], currentTexts: ArrowLineText[]) {
        if (previousTexts === currentTexts) return;
        const previousTextsLength = previousTexts.length;
        const currentTextsLength = currentTexts.length;
        const textManages = this.getRef().getTextManages();
        if (currentTextsLength === previousTextsLength) {
            for (let i = 0; i < previousTextsLength; i++) {
                if (previousTexts[i].text !== currentTexts[i].text) {
                    textManages[i].updateText(currentTexts[i].text);
                }
            }
        } else {
            this.getRef().destroyTextManage();
            this.initializeTextManages();
            this.drawText();
        }
    }

    updateTextRectangle() {
        const textManages = this.getRef().getTextManages();
        textManages.forEach((manage) => {
            manage.updateRectangle();
        });
    }

    destroy(): void {
        super.destroy();
        this.activeGenerator.destroy();
        this.getRef().destroyTextManage();
    }
}
