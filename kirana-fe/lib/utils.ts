import { customAlphabet } from "nanoid";

// nanoid with alphanumeric charset (no ambiguous chars like 0/O, 1/I/l)
const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const nanoid = customAlphabet(alphabet, 8);

// Generate a short order ID (8 chars, collision-resistant)
export function generateOrderId(): string {
  return nanoid();
}
