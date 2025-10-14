// Draft: all PlaitElement types

export type Point = [number, number];

export interface PlaitElement {
    [key: string]: any;
    id: string;
    children?: PlaitElement[];
    points?: [number, number][];
    type?: string;
    groupId?: string;
    angle?: number;
}

export interface PlaitGroup extends PlaitElement {
    type: 'group';
}

export enum ArrowLineShape {
    straight = 'straight',
    curve = 'curve',
    elbow = 'elbow'
}

export enum ArrowLineMarkerType {
    arrow = 'arrow',
    none = 'none',
    openTriangle = 'open-triangle',
    solidTriangle = 'solid-triangle',
    sharpArrow = 'sharp-arrow',
    oneSideUp = 'one-side-up',
    oneSideDown = 'one-side-down',
    hollowTriangle = 'hollow-triangle',
    singleSlash = 'single-slash'
}

export interface FlowBaseData {
    text?: Element;
    icon?: string;
}

export enum FlowElementType {
    node = 'node',
    edge = 'edge'
}

export interface FlowElementStyles {
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    fillStyle?: string;
    activeStroke?: string;
    activeFill?: string;
    borderRadius?: number;
    hoverStroke?: string;
}

export interface FlowElement<T extends FlowBaseData = FlowBaseData> extends PlaitElement {
    id: string;
    type: FlowElementType;
    data?: T;
    undeletable?: boolean;
    styles?: FlowElementStyles;
}

export interface ArrowLineHandle {
    boundId?: string;
    connection?: [number, number];
    marker: ArrowLineMarkerType;
}

export enum StrokeStyle {
    solid = 'solid',
    dashed = 'dashed',
    dotted = 'dotted'
}

export interface ArrowLineText {
    text: Element;
    // Percentage of positioning based on line length
    position: number;
}

export enum BasicShapes {
    rectangle = 'rectangle',
    ellipse = 'ellipse',
    diamond = 'diamond',
    roundRectangle = 'roundRectangle',
    parallelogram = 'parallelogram',
    text = 'text',
    triangle = 'triangle',
    leftArrow = 'leftArrow',
    trapezoid = 'trapezoid',
    rightArrow = 'rightArrow',
    cross = 'cross',
    star = 'star',
    pentagon = 'pentagon',
    hexagon = 'hexagon',
    octagon = 'octagon',
    pentagonArrow = 'pentagonArrow',
    processArrow = 'processArrow',
    twoWayArrow = 'twoWayArrow',
    comment = 'comment',
    roundComment = 'roundComment',
    cloud = 'cloud'
}

export enum FlowchartSymbols {
    process = 'process',
    decision = 'decision',
    data = 'data',
    connector = 'connector',
    terminal = 'terminal',
    manualInput = 'manualInput',
    preparation = 'preparation',
    manualLoop = 'manualLoop',
    merge = 'merge',
    delay = 'delay',
    storedData = 'storedData',
    or = 'or',
    summingJunction = 'summingJunction',
    predefinedProcess = 'predefinedProcess',
    offPage = 'offPage',
    document = 'document',
    multiDocument = 'multiDocument',
    database = 'database',
    hardDisk = 'hardDisk',
    internalStorage = 'internalStorage',
    noteCurlyRight = 'noteCurlyRight',
    noteCurlyLeft = 'noteCurlyLeft',
    noteSquare = 'noteSquare',
    display = 'display'
}

export enum UMLSymbols {
    actor = 'actor',
    useCase = 'useCase',
    container = 'container',
    note = 'note',
    simpleClass = 'simpleClass',
    activityClass = 'activityClass',
    branchMerge = 'branchMerge',
    port = 'port',
    package = 'package',
    combinedFragment = 'combinedFragment',
    class = 'class',
    interface = 'interface',
    object = 'object',
    component = 'component',
    componentBox = 'componentBox',
    template = 'template',
    activation = 'activation',
    deletion = 'deletion',
    assembly = 'assembly',
    providedInterface = 'providedInterface',
    requiredInterface = 'requiredInterface'
}

export type GeometryShapes = BasicShapes | FlowchartSymbols | UMLSymbols;

export type SwimlaneDirection = 'horizontal' | 'vertical';

export interface PlaitBaseGeometry<T extends string = 'geometry', P extends Point[] = [Point, Point], S extends string = GeometryShapes>
    extends PlaitElement {
    type: T;
    points: P;
    shape: S;
}

export interface PlaitCommonGeometry<T extends string = 'geometry', P extends Point[] = [Point, Point], S extends string = GeometryShapes>
    extends PlaitBaseGeometry<T, P, S> {
    // node style attributes
    fill?: string;
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: StrokeStyle;
    angle?: number;
    opacity?: number;
}

export interface PlaitCustomGeometry<T extends string = string, P extends Point[] = Point[], S extends string = string>
    extends PlaitBaseGeometry<T, P, S> {}

export interface PlaitMultipleTextGeometry extends PlaitCommonGeometry {
    texts: DrawTextInfo[];
}

export interface TextRectangleOptions {
    id: string;
    // board?: PlaitBoard;
}

export interface DrawTextInfo extends TextRectangleOptions {
    text: ParagraphElement;
}

export interface PlaitArrowLine extends PlaitElement {
    //
    type: 'arrow-line';
    shape: ArrowLineShape;
    points: Point[];

    source: ArrowLineHandle;
    target: ArrowLineHandle;

    texts: ArrowLineText[];

    // node style attributes
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: StrokeStyle;

    opacity: number;
}

export interface PlaitCommonImage extends PlaitElement {
    points: [Point, Point];
    type: 'image';
    angle: number;
}

export enum Alignment {
    left = 'left',
    center = 'center',
    right = 'right'
}

export interface PlaitTableCellParagraph {
    direction?: 'vertical' | 'horizontal';
    children: any[]; // Descendant[];
    align?: Alignment;
}

export interface PlaitTableCell {
    id: string;
    rowId: string;
    columnId: string;
    colspan?: number;
    rowspan?: number;
    text?: PlaitTableCellParagraph;
    fill?: string;
}

export interface PlaitBaseTable extends PlaitElement {
    id: string;
    points: Point[];
    rows: {
        id: string;
        height?: number;
    }[];
    columns: {
        id: string;
        width?: number;
    }[];
    cells: PlaitTableCell[];
    groupId?: string;
}

export enum VectorLineShape {
    straight = ArrowLineShape.straight,
    curve = ArrowLineShape.curve
}

export interface PlaitVectorLine extends PlaitElement {
    type: 'vector-line';
    shape: VectorLineShape;
    points: Point[];
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: StrokeStyle;
    fill?: string;
    opacity: number;
}

export interface NodeIconItem {
    name: string;
    fontSize?: number;
    color?: string;
}

export interface ForceAtlasNodeElement extends PlaitElement {
    label: string;
    icon: string | NodeIconItem;
    size?: number;
    isActive?: boolean;
}

export interface ForceAtlasEdgeElement extends PlaitElement {
    source: string;
    target: string;
}

export interface ForceAtlasElement extends PlaitElement {
    children: (ForceAtlasNodeElement | ForceAtlasEdgeElement)[];
}

export enum MindLayoutType {
    'right' = 'right',
    'left' = 'left',
    'standard' = 'standard',
    'upward' = 'upward',
    'downward' = 'downward',
    'rightBottomIndented' = 'right-bottom-indented',
    'rightTopIndented' = 'right-top-indented',
    'leftTopIndented' = 'left-top-indented',
    'leftBottomIndented' = 'left-bottom-indented'
}

export enum MindElementShape {
    roundRectangle = 'round-rectangle',
    underline = 'underline'
}

export enum BranchShape {
    bight = 'bight',
    polyline = 'polyline'
}

export interface BaseMindElement extends PlaitElement {
    rightNodeCount?: number;
    manualWidth?: number;

    // node style attributes
    fill?: string;
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: StrokeStyle;
    shape?: MindElementShape;

    // link style attributes
    branchColor?: string;
    branchWidth?: number;
    branchShape?: BranchShape;

    // layout
    layout?: MindLayoutType;
    isCollapsed?: boolean;

    start?: number;
    end?: number;
}

export interface EmojiItem {
    name: string;
}

export interface CommonImageItem {
    url: string;
    width: number;
    height: number;
}

export interface ParagraphElement {
    children: any[]; // Descendant[];
    align?: Alignment;
}

export interface BaseData {
    topic: ParagraphElement;
    emojis?: EmojiItem[];
    image?: CommonImageItem;
}
export interface MindElement<T = BaseData> extends BaseMindElement {
    type: 'mind_child' | 'mind' | 'mindmap';
    children: MindElement[];
    data: T;
}
