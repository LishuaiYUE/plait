import { PlaitElement } from './element';

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
    | 'sync_status'
    | 'elements_clear';

export interface InitialElementsMessage extends WebSocketMessage {
    type: 'initial_elements';
    elements: PlaitElement[];
}

export interface SyncStatusMessage extends WebSocketMessage {
    type: 'sync_status';
    elementCount: number;
    timestamp: string;
}

export interface ElementCreatedMessage extends WebSocketMessage {
    type: 'element_created';
    element: PlaitElement;
  }
  
  export interface ElementUpdatedMessage extends WebSocketMessage {
    type: 'element_updated';
    element: PlaitElement;
  }
  
  export interface ElementDeletedMessage extends WebSocketMessage {
    type: 'element_deleted';
    elementId: string;
  }
  
  export interface BatchCreatedMessage extends WebSocketMessage {
    type: 'elements_batch_created';
    elements: PlaitElement[];
  }
  
  export interface SyncStatusMessage extends WebSocketMessage {
    type: 'sync_status';
    elementCount: number;
    timestamp: string;
  }