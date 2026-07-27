import { fakeAsync, tick } from '@angular/core/testing';
import { createTestingBoard } from '../testing';
import { IS_BOARD_ALIVE } from './weak-maps';
import { debounce, flushThrottleRAF, throttleRAF } from './common';

describe('debounce', () => {
    let func: jasmine.Spy;
    let debouncedFunc: ReturnType<typeof debounce>;
    const wait = 100;

    beforeEach(() => {
        func = jasmine.createSpy('func');
        debouncedFunc = debounce(func, wait);
    });

    it('should call the function after the wait time', fakeAsync(() => {
        debouncedFunc();
        expect(func).not.toHaveBeenCalled();
        tick(wait);
        expect(func).toHaveBeenCalled();
    }));

    it('should not call the function if called again within the wait time', fakeAsync(() => {
        debouncedFunc();
        debouncedFunc();
        expect(func).not.toHaveBeenCalled();
        tick(wait);
        expect(func).toHaveBeenCalledTimes(1);
    }));

    it('should call the function immediately if leading option is true', fakeAsync(() => {
        const debouncedFuncLeading = debounce(func, wait, { leading: true });
        debouncedFuncLeading();
        expect(func).toHaveBeenCalled();
        tick(wait);
        expect(func).toHaveBeenCalledTimes(1);
    }));

    it('should call the function again after the wait time if leading option is true', fakeAsync(() => {
        const debouncedFuncLeading = debounce(func, wait, { leading: true });
        debouncedFuncLeading();
        expect(func).toHaveBeenCalledTimes(1);
        debouncedFuncLeading();
        expect(func).toHaveBeenCalledTimes(1);
        tick(wait);
        expect(func).toHaveBeenCalledTimes(2);
    }));
});

describe('throttleRAF', () => {
    it('should synchronously flush the pending callback once', fakeAsync(() => {
        const board = createTestingBoard([], []);
        const callback = jasmine.createSpy('callback');
        IS_BOARD_ALIVE.set(board, true);

        throttleRAF(board, 'test', callback);
        flushThrottleRAF(board, 'test');

        expect(callback).toHaveBeenCalledTimes(1);
        tick(16);
        expect(callback).toHaveBeenCalledTimes(1);
        IS_BOARD_ALIVE.delete(board);
    }));

    it('should flush only the latest pending callback', fakeAsync(() => {
        const board = createTestingBoard([], []);
        const firstCallback = jasmine.createSpy('firstCallback');
        const latestCallback = jasmine.createSpy('latestCallback');
        IS_BOARD_ALIVE.set(board, true);

        throttleRAF(board, 'test', firstCallback);
        throttleRAF(board, 'test', latestCallback);
        flushThrottleRAF(board, 'test');

        expect(firstCallback).not.toHaveBeenCalled();
        expect(latestCallback).toHaveBeenCalledTimes(1);
        tick(16);
        expect(latestCallback).toHaveBeenCalledTimes(1);
        IS_BOARD_ALIVE.delete(board);
    }));
});
