import {
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    ElementRef,
    HostListener,
    OnDestroy,
    OnInit,
    ViewChild,
    ChangeDetectorRef
} from '@angular/core';
import {
    BoardTransforms,
    PlaitBoard,
    PlaitBoardOptions,
    PlaitElement,
    PlaitTheme,
    ThemeColorMode,
    Viewport,
    getClipboardData,
    getProbablySupportsClipboardWrite,
    getSelectedElements,
    toHostPoint,
    toViewBoxPoint,
    canRemoveGroup,
    canAddGroup,
    deleteFragment,
    Transforms,
    duplicateElements,
    setFragment,
    WritableClipboardOperationType,
    PlaitPlugin,
    isHandMode
} from '@plait/core';
import { mockDrawData, mockTableData, mockMindData, mockRotateData, mockGroupData, mockSwimlaneData } from './mock-data';
import { withMind, PlaitMindBoard, PlaitMind } from '@plait/mind';
import { AbstractResizeState, MindThemeColors } from '@plait/mind';
import { withMindExtend } from '../plugins/with-mind-extend';
import { PlaitGeometry, withDraw } from '@plait/draw';
import { AppSettingPanelComponent } from '../components/setting-panel/setting-panel.component';
import { AppMainToolbarComponent } from '../components/main-toolbar/main-toolbar.component';
import { AppZoomToolbarComponent } from '../components/zoom-toolbar/zoom-toolbar.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { mockLineData, withLineRoute } from '../plugins/with-line-route';
import { withCommonPlugin } from '../plugins/with-common';
import { AppMenuComponent } from '../components/menu/menu.component';

import { mockTurningPointData } from './mock-turning-point-data';
import { withGroup } from '@plait/common';
import { OnChangeData, PlaitBoardComponent } from '@plait/angular-board';
import 'deep-chat';

const LOCAL_STORAGE_KEY = 'plait-board-data';

@Component({
    selector: 'app-basic-editor',
    templateUrl: './editor.component.html',
    imports: [
        PlaitBoardComponent,
        FormsModule,
        AppZoomToolbarComponent,
        AppMainToolbarComponent,
        AppSettingPanelComponent,
        AppMenuComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BasicEditorComponent implements OnInit, OnDestroy {
    plugins: PlaitPlugin[] = [withCommonPlugin, withMind, withMindExtend, withDraw, withGroup];

    value: (PlaitElement | PlaitGeometry | PlaitMind)[] = [];

    options: PlaitBoardOptions = {
        readonly: false,
        hideScrollbar: false,
        disabledScrollOnNonFocus: false,
        themeColors: MindThemeColors
    };

    viewport!: Viewport;

    theme!: PlaitTheme;

    board!: PlaitBoard;

    showPaste = getProbablySupportsClipboardWrite();

    selectedElements: PlaitElement[] = [];

    showAddGroup!: boolean;

    showRemoveGroup!: boolean;

    CONTROL_KEY = typeof window != 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform) ? '⌘' : 'Ctrl';

    private websocket: WebSocket | null = null;

    @ViewChild('contextMenu', { static: true, read: ElementRef })
    contextMenu!: ElementRef<any>;

    @HostListener('contextmenu', ['$event']) onContextmenu(event: MouseEvent) {
        if (!this.board.options.readonly) {
            event?.preventDefault();
        }
    }

    @HostListener('mouseup', ['$event'])
    onMouseup(event: MouseEvent): void {
        this.contextMenu.nativeElement.style.display = 'none';
        if (event.button === 2 && !this.board.options.readonly && !isHandMode(this.board)) {
            this.contextMenu.nativeElement.style.display = 'block';
            this.contextMenu.nativeElement.style.left = `${event.clientX}px`;
            this.contextMenu.nativeElement.style.top = `${event.clientY}px`;
        }
    }

    history = [
        { role: 'user', text: 'Hey, how are you today?' },
        { role: 'ai', text: 'I am doing very well!' }
    ];

    constructor(private activeRoute: ActivatedRoute, private cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        // this.activeRoute.queryParams.subscribe((params: Params) => {
        //     const init = params['init'];
        //     switch (init) {
        //         case 'mind':
        //             this.value = [...mockMindData];
        //             break;
        //         case 'draw':
        //             this.value = [...mockDrawData];
        //             break;
        //         case 'local-storage':
        //             const data = this.getLocalStorage();
        //             if (data) {
        //                 this.value = data.children;
        //                 this.viewport = data.viewport;
        //                 this.theme = data.theme;
        //             }
        //             break;
        //         case 'empty':
        //             this.value = [];
        //             break;
        //         case 'route':
        //             this.value = [...mockLineData];
        //             this.plugins.push(withLineRoute);
        //             break;
        //         case 'turning-point':
        //             this.value = [...mockTurningPointData];
        //             break;
        //         case 'group':
        //             this.value = [...mockGroupData];
        //             break;
        //         case 'table':
        //             this.value = [...mockTableData];
        //             break;
        //         case 'swimlane':
        //             this.value = [...mockSwimlaneData];
        //             break;
        //         case 'rotate':
        //             this.value = [...mockRotateData];
        //             break;
        //         default:
        //             this.value = [...mockDrawData];
        //             break;
        //     }
        // });

        // 调一下 get /api/clear 清空元素
        // this.clearElements();

        this.connectWebSocket();
    }

    change(event: OnChangeData) {
        this.setLocalData(JSON.stringify(event));
        this.selectedElements = getSelectedElements(this.board);
        this.showRemoveGroup = canRemoveGroup(this.board);
        this.showAddGroup = canAddGroup(this.board);
        this.contextMenu.nativeElement.style.display = 'none';
    }

    getLocalStorage() {
        const data = localStorage.getItem(`${LOCAL_STORAGE_KEY}`);
        return data ? JSON.parse(data) : null;
    }

    setLocalData(data: string) {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}`, data);
    }

    plaitBoardInitialized(value: PlaitBoard) {
        this.board = value;
        (this.board as PlaitMindBoard).onAbstractResize = (state: AbstractResizeState) => {};
    }

    themeChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value;
        BoardTransforms.updateThemeColor(this.board, value as ThemeColorMode);
    }

    copy(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        setFragment(this.board, WritableClipboardOperationType.copy, null);
    }

    cut(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        setFragment(this.board, WritableClipboardOperationType.cut, null);
        deleteFragment(this.board);
    }

    addGroup(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        Transforms.addGroup(this.board);
    }

    removeGroup(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        Transforms.removeGroup(this.board);
    }

    duplicate(event: MouseEvent) {
        event.stopPropagation();
        event.preventDefault();
        duplicateElements(this.board);
    }

    async paste(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        const targetPoint = toViewBoxPoint(this.board, toHostPoint(this.board, event.x, event.y));
        const clipboardData = await getClipboardData(null);
        this.board.insertFragment(clipboardData, targetPoint, WritableClipboardOperationType.paste);
    }

    private connectWebSocket(): void {
        try {
            const url = 'ws://localhost:3000';
            this.websocket = new WebSocket(url);

            this.websocket.onopen = (event) => {};

            this.websocket.onmessage = (event) => {
                this.handleWebSocketMessage(event.data);
            };

            this.websocket.onerror = (error) => {};

            this.websocket.onclose = (event) => {};
        } catch (error) {}
    }

    private handleWebSocketMessage(data: string): void {
        try {
            const parsedData = JSON.parse(data);
            console.log('------------------------------');
            console.log('ws parsedData：', parsedData);

            switch (parsedData.type) {
                case 'initial_elements':
                    // this.value = [...parsedData.elements];
                    this.value = [
                        {
                            id: '7LnvoZ',
                            type: 'geometry',
                            points: [
                                [50, 50],
                                [150, 100]
                            ],
                            shape: 'ellipse',
                            text: {
                                type: 'paragraph',
                                children: [
                                    {
                                        text: '开始'
                                    }
                                ],
                                align: 'center'
                            },
                            angle: 0,
                            fill: '#87CEEB',
                            strokeColor: '#4169E1',
                            strokeWidth: 2,
                            strokeStyle: 'solid',
                            opacity: 1
                        },
                        {
                            id: 'nGpNBk',
                            type: 'geometry',
                            points: [
                                [200, 150],
                                [400, 250]
                            ],
                            shape: 'rectangle',
                            text: {
                                type: 'paragraph',
                                children: [
                                    {
                                        text: 'MCP客户端'
                                    }
                                ],
                                align: 'center'
                            },
                            angle: 0,
                            fill: '#98FB98',
                            strokeColor: '#228B22',
                            strokeWidth: 2,
                            strokeStyle: 'solid',
                            opacity: 1
                        },
                        {
                            id: 'SxuxL2',
                            type: 'geometry',
                            points: [
                                [450, 150],
                                [650, 250]
                            ],
                            shape: 'rectangle',
                            text: {
                                type: 'paragraph',
                                children: [
                                    {
                                        text: 'MCP服务器'
                                    }
                                ],
                                align: 'center'
                            },
                            angle: 0,
                            fill: '#FFB6C1',
                            strokeColor: '#DC143C',
                            strokeWidth: 2,
                            strokeStyle: 'solid',
                            opacity: 1
                        },
                        {
                            id: 'o5Ga2a',
                            type: 'geometry',
                            points: [
                                [300, 300],
                                [500, 400]
                            ],
                            shape: 'parallelogram',
                            text: {
                                type: 'paragraph',
                                children: [
                                    {
                                        text: '请求消息'
                                    }
                                ],
                                align: 'center'
                            },
                            angle: 0,
                            fill: '#FFD700',
                            strokeColor: '#FF8C00',
                            strokeWidth: 2,
                            strokeStyle: 'solid',
                            opacity: 1
                        },
                        {
                            id: 'DrrDiY',
                            type: 'geometry',
                            points: [
                                [300, 450],
                                [500, 550]
                            ],
                            shape: 'parallelogram',
                            text: {
                                type: 'paragraph',
                                children: [
                                    {
                                        text: '响应消息'
                                    }
                                ],
                                align: 'center'
                            },
                            angle: 0,
                            fill: '#DDA0DD',
                            strokeColor: '#8A2BE2',
                            strokeWidth: 2,
                            strokeStyle: 'solid',
                            opacity: 1
                        },
                        {
                            id: 'o0lzfH',
                            type: 'geometry',
                            points: [
                                [550, 450],
                                [750, 550]
                            ],
                            shape: 'diamond',
                            text: {
                                type: 'paragraph',
                                children: [
                                    {
                                        text: '错误处理'
                                    }
                                ],
                                align: 'center'
                            },
                            angle: 0,
                            fill: '#FFA07A',
                            strokeColor: '#FF4500',
                            strokeWidth: 2,
                            strokeStyle: 'solid',
                            opacity: 1
                        },
                        {
                            id: 'njKxrR',
                            type: 'geometry',
                            points: [
                                [350, 600],
                                [450, 650]
                            ],
                            shape: 'ellipse',
                            text: {
                                type: 'paragraph',
                                children: [
                                    {
                                        text: '结束'
                                    }
                                ],
                                align: 'center'
                            },
                            angle: 0,
                            fill: '#87CEEB',
                            strokeColor: '#4169E1',
                            strokeWidth: 2,
                            strokeStyle: 'solid',
                            opacity: 1
                        },
                        {
                            id: 'lUpgkD',
                            type: 'arrow-line',
                            points: [
                                [100, 100],
                                [200, 200]
                            ],
                            shape: 'straight',
                            source: {
                                boundId: '7LnvoZ',
                                marker: 'none'
                            },
                            target: {
                                boundId: 'nGpNBk',
                                marker: 'arrow'
                            },
                            texts: [],
                            strokeColor: '#000000',
                            strokeWidth: 2,
                            strokeStyle: 'solid',
                            opacity: 1
                        },
                        {
                            id: 'VMX3YC',
                            type: 'arrow-line',
                            points: [
                                [300, 200],
                                [300, 300]
                            ],
                            shape: 'straight',
                            source: {
                                boundId: 'nGpNBk',
                                marker: 'none'
                            },
                            target: {
                                boundId: 'o5Ga2a',
                                marker: 'arrow'
                            },
                            texts: [],
                            strokeColor: '#000000',
                            strokeWidth: 2,
                            strokeStyle: 'solid',
                            opacity: 1
                        },
                        {
                            id: 'gfH6Av',
                            type: 'arrow-line',
                            points: [
                                [400, 350],
                                [450, 250]
                            ],
                            shape: 'straight',
                            source: {
                                boundId: 'o5Ga2a',
                                marker: 'none'
                            },
                            target: {
                                boundId: 'SxuxL2',
                                marker: 'arrow'
                            },
                            texts: [],
                            strokeColor: '#000000',
                            strokeWidth: 2,
                            strokeStyle: 'solid',
                            opacity: 1
                        },
                        {
                            id: 'BuPf87',
                            type: 'arrow-line',
                            points: [
                                [550, 250],
                                [400, 450]
                            ],
                            shape: 'straight',
                            source: {
                                boundId: 'SxuxL2',
                                marker: 'none'
                            },
                            target: {
                                boundId: 'DrrDiY',
                                marker: 'arrow'
                            },
                            texts: [],
                            strokeColor: '#000000',
                            strokeWidth: 2,
                            strokeStyle: 'solid',
                            opacity: 1
                        },
                        {
                            id: 'bqjBV9',
                            type: 'arrow-line',
                            points: [
                                [300, 500],
                                [300, 600]
                            ],
                            shape: 'straight',
                            source: {
                                boundId: 'DrrDiY',
                                marker: 'none'
                            },
                            target: {
                                boundId: 'njKxrR',
                                marker: 'arrow'
                            },
                            texts: [],
                            strokeColor: '#000000',
                            strokeWidth: 2,
                            strokeStyle: 'solid',
                            opacity: 1
                        },
                        {
                            id: 'Vlm4Qo',
                            type: 'arrow-line',
                            points: [
                                [400, 200],
                                [550, 450]
                            ],
                            shape: 'elbow',
                            source: {
                                boundId: 'nGpNBk',
                                marker: 'none'
                            },
                            target: {
                                boundId: 'o0lzfH',
                                marker: 'arrow'
                            },
                            texts: [],
                            strokeColor: '#FF0000',
                            strokeWidth: 2,
                            strokeStyle: 'dashed',
                            opacity: 1
                        },
                        {
                            id: '-iaYBw',
                            type: 'arrow-line',
                            points: [
                                [650, 500],
                                [400, 600]
                            ],
                            shape: 'elbow',
                            source: {
                                boundId: 'o0lzfH',
                                marker: 'none'
                            },
                            target: {
                                boundId: 'njKxrR',
                                marker: 'arrow'
                            },
                            texts: [],
                            strokeColor: '#FF0000',
                            strokeWidth: 2,
                            strokeStyle: 'dashed',
                            opacity: 1
                        },
                        {
                            id: '7zatBu',
                            type: 'arrow-line',
                            points: [
                                [500, 500],
                                [300, 200]
                            ],
                            shape: 'elbow',
                            source: {
                                boundId: 'DrrDiY',
                                marker: 'none'
                            },
                            target: {
                                boundId: 'nGpNBk',
                                marker: 'arrow'
                            },
                            texts: [],
                            strokeColor: '#000000',
                            strokeWidth: 2,
                            strokeStyle: 'solid',
                            opacity: 1
                        }
                    ];

                    break;
                case 'element_created': {
                    this.value = [...this.value, parsedData.element];
                    break;
                }
                case 'elements_batch_created': {
                    this.value = [...this.value, ...parsedData.elements];
                    break;
                }
                case 'element_updated': {
                    const updatedElement = parsedData.element;
                    this.value = this.value.map((element) => (element.id === updatedElement.id ? updatedElement : element));
                    break;
                }
                case 'element_deleted': {
                    this.value = this.value.filter((element) => element.id !== parsedData.elementId);
                    break;
                }
                default:
                    break;
            }

            this.value = this.value.map((element: PlaitElement) => {
                // 有时候模型会把element的属性套在了element.properties里，这里兼容处理一下
                if (element.properties) {
                    element = {
                        id: element.id,
                        ...element.properties
                    };
                }

                // 文本的格式需要满足  element.type=geometry && element.shape=paragraph && element.text.type = paragraph，模型返回的数据经常满足不了，这里兼容转一下
                if (element.type === 'paragraph' || (element.type === 'geometry' && element.text)) {
                    element = {
                        ...element,
                        type: 'geometry',
                        shape: 'text',
                        text: element.text
                            ? {
                                  ...element.text,
                                  type: 'paragraph'
                              }
                            : element.text
                    };
                }

                return element;
            });

            console.log('value：', this.value);
            this.cdr.detectChanges();
        } catch (error) {
            console.log('handleWebSocketMessage error：', error);
        }
    }

    private disconnectWebSocket(): void {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
    }

    private async clearElements(): Promise<void> {
        try {
            const response = await fetch('http://localhost:3000/api/clear', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('清空元素成功:', result);
                // 清空本地数据
                this.value = [];
                this.cdr.detectChanges();
            } else {
                console.error('清空元素失败:', response.status, response.statusText);
                // 尝试读取响应内容来调试
                const text = await response.text();
                console.error('响应内容:', text);
            }
        } catch (error) {
            console.error('调用清空接口出错:', error);
        }
    }

    ngOnDestroy(): void {
        this.disconnectWebSocket();
    }
}
