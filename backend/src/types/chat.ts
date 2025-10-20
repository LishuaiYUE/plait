export type ChatMessageItem = { role: string; content: string | any; [x: string]: any };
export type ChatMessages = Array<ChatMessageItem>;
export type ChatInputMessageItem = { role: string; text: string };
export type ChatInputMessages = Array<ChatInputMessageItem>;
