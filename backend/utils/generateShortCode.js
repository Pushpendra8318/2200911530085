import { customAlphabet } from "nanoid";

// generate 6-char short code (a-z,0-9)
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

export const generateShortCode = () => nanoid();
