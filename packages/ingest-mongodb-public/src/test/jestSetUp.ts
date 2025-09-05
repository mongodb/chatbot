import { logger } from "mongodb-rag-core";
// silence logger for tests
logger.transports.forEach((t) => (t.silent = true));

// Polyfill File API for Node.js environment if not available
// This fixes issues with cheerio/undici in CI environments
if (typeof globalThis.File === "undefined") {
  try {
    // Try to use Node.js built-in File from buffer module (available in Node 20+)
    const { File } = require("node:buffer");
    (globalThis as any).File = File;
  } catch {
    // Fallback for older Node.js versions
    const { Blob } = require("node:buffer");
    (globalThis as any).File = class File extends Blob {
      name: string;
      lastModified: number;

      constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
        super(bits, options);
        this.name = name;
        this.lastModified = options?.lastModified ?? Date.now();
      }
    };
  }
}
