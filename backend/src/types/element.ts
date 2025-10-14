import { Point } from "./point";

export interface PlaitElement {
    [key: string]: any;
    id: string;
    children?: PlaitElement[];
    points?: Point[];
    type?: string;
    groupId?: string;
    angle?: number;
}

export const elements = new Map<string, PlaitElement>();