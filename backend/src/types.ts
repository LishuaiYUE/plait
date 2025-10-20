export const elementTypes = ['text', 'rectangle', 'ellipse', 'diamond', 'triangle', 'arrow', 'line', 'freedraw', 'image', 'video', 'audio', 'file', 'sticker', 'text_box', 'code_block', 'shape', 'link', 'frame', 'table', 'chart', 'mindmap', 'flowchart', 'sequence_diagram', 'class_diagram', 'state_di'];
export interface WebSocketMessage {
    type: WebSocketMessageType;
    [key: string]: any;
}

export type WebSocketMessageType =
    | 'initial_elements'
    | 'element_created'
    | 'element_updated'
    | 'element_deleted'
    | 'elements_batch_created'
    | 'elements_synced'
    | 'sync_status';

export interface InitialElementsMessage extends WebSocketMessage {
    type: 'initial_elements';
    elements: any[];
}

export const elements = new Map<string, any>();

export interface SyncStatusMessage extends WebSocketMessage {
    type: 'sync_status';
    elementCount: number;
    timestamp: string;
}

export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}