import { customAlphabet } from 'nanoid/async';

const alphanumeric = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
const aAlphabet = customAlphabet(alphanumeric, 10);
export const generateId = async (size: number = 6) => {
    return await aAlphabet(size);
};