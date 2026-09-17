import { PlaitMindComponent } from './mind.component';
import { MindNode, PlaitMind } from './interfaces';

describe('PlaitMindComponent', () => {
    it('applies a saved manual offset after automatic layout', () => {
        const mind = {
            type: 'mind',
            points: [[100, 200]],
            children: [],
            data: { topic: 'root' },
            manualOffset: [12, -8]
        } as unknown as PlaitMind;
        const root = {
            x: 10,
            y: 20,
            hGap: 2,
            vGap: 3,
            children: [],
            origin: mind
        } as unknown as MindNode;
        const component = new PlaitMindComponent();
        component.root = root;

        component.updateMindNodeLocation(mind);

        expect(root.x).toBe(110);
        expect(root.y).toBe(189);
    });
});
