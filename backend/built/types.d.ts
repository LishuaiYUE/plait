export declare const elementTypes: string[];
export interface WebSocketMessage {
    type: WebSocketMessageType;
    [key: string]: any;
}
export type WebSocketMessageType = 'initial_elements' | 'element_created' | 'element_updated' | 'element_deleted' | 'elements_batch_created' | 'elements_synced' | 'sync_status';
export interface InitialElementsMessage extends WebSocketMessage {
    type: 'initial_elements';
    elements: any[];
}
export declare const elements: Map<string, any>;
export interface SyncStatusMessage extends WebSocketMessage {
    type: 'sync_status';
    elementCount: number;
    timestamp: string;
}
export declare function generateId(): string;
//# sourceMappingURL=types.d.ts.map