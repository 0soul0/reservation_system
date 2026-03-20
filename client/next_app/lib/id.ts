import { nanoid } from 'nanoid';

export function generateUid(prev: string = ""): string {
    return prev + nanoid(10);
}
