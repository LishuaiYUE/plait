import { PlaitBoard } from '../interfaces/board';
import { isFromScrolling, setIsFromScrolling } from '../utils/viewport';

export function withViewport(board: PlaitBoard) {
    const { onChange } = board;

    board.onChange = () => {
        const isSetViewport = board.operations.length && board.operations.some(op => op.type === 'set_viewport');
        const isOnlySetSelection = board.operations.length && board.operations.every(op => op.type === 'set_selection');
        if (isOnlySetSelection) {
            return onChange();
        }
        if (isSetViewport && isFromScrolling(board)) {
            setIsFromScrolling(board, false);
            return onChange();
        }
        onChange();
    };

    return board;
}
