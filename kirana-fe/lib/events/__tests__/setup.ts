import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock global headers for Next.js
vi.mock("next/headers", () => ({
    headers: vi.fn(async () => new Map()),
}));

// Mock fetch
global.fetch = vi.fn(() =>
    Promise.resolve({
        status: 204,
        ok: true,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(""),
    } as Response)
);
