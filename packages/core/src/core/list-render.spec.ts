import { PlaitBoard, PlaitElement, createG, createTestingBoard, getElementById } from '../public-api';
import { ElementFlavour } from './element/element-flavour';
import { ListRender } from './list-render';

class TestElementComponent extends ElementFlavour {
    constructor() {
        super({});
    }
}

describe('ListRender', () => {
    it('refreshes visibility when an element identity changes', () => {
        const element = { id: 'a', type: 'test' } as PlaitElement;
        const board = createTestingBoard([], [element]);
        board.drawElement = () => TestElementComponent;
        board.isVisible = (value) => !(value as PlaitElement & { hidden?: boolean }).hidden;
        const parentG = createG();
        const listRender = new ListRender(board);
        listRender.initialize(board.children, { board, parent: board, parentG });

        expect(PlaitElement.getContainerG(element, { suppressThrow: false })!.style.display).toBe('');

        const hiddenElement = { ...element, hidden: true };
        board.children = [hiddenElement];
        listRender.update(board.children, { board, parent: board, parentG });

        expect(PlaitElement.getContainerG(hiddenElement, { suppressThrow: false })!.style.display).toBe('none');
        listRender.destroy();
    });

    it('refreshes dependent visibility after all element contexts have changed', () => {
        const dependent = { id: 'dependent', type: 'test' } as PlaitElement;
        const owner = { id: 'owner', type: 'test', hidden: false } as PlaitElement & { hidden: boolean };
        const board = createTestingBoard([], [dependent, owner]);
        board.drawElement = () => TestElementComponent;
        board.isVisible = (element) => {
            if (element.id !== dependent.id) {
                return true;
            }
            return !getElementById<PlaitElement & { hidden: boolean }>(board, owner.id)?.hidden;
        };
        const parentG = createG();
        const listRender = new ListRender(board);
        listRender.initialize(board.children, { board, parent: board, parentG });

        const hiddenOwner = { ...owner, hidden: true };
        board.children = [dependent, hiddenOwner];
        listRender.update(board.children, { board, parent: board, parentG });

        expect(PlaitElement.getContainerG(dependent, { suppressThrow: false })!.style.display).toBe('none');
        listRender.destroy();
    });
});

describe('mountElementG', () => {
    describe('default', () => {
        it('container g should have correct position', () => {});
        it('children element should have a root container g', () => {});
        it(`children element's g should have been before of it's parent element container g`, () => {});
        it(`should add to correct position when insert a element`, () => {});
        it(`should add to correct position when insert a child element`, () => {});
        it(`should add to correct position when insert a element at start position`, () => {});
        it(`should add to correct position when insert a child element at start position`, () => {});
    });
    describe('move', () => {
        it('should move container g to correct when move element', () => {});
        it('should move container g to correct when move element to start position', () => {});
        it('should move container g to correct when move element to start position and element has been updated', () => {});
        it('should move multiple container g to correct when move multiple elements to start position', () => {});
    });
});
