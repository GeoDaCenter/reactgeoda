import {TextEncoder, TextDecoder} from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

global.window.URL.createObjectURL = jest.fn();

// add global definition for web worker in Jest
type MessageHandler = (msg: string) => void;

class Worker {
  url: string;
  onmessage: MessageHandler;
  constructor(stringUrl: string) {
    this.url = stringUrl;
    this.onmessage = () => {};
  }
  postMessage(msg: string): void {
    this.onmessage(msg);
  }
}

Object.defineProperty(window, 'Worker', {
  writable: true,
  value: Worker
});

// add global definition for fetch in Jest
global.fetch = jest.fn(
  () =>
    Promise.resolve({
      ok: true,
      json: jest.fn().mockResolvedValue({data: 'mocked data'})
    }) as unknown as Promise<Response>
);

// add global definition for Request in Jest
global.Request = jest.fn();

// add global definition for Response in Jest
global.Response = jest.fn(
  () =>
    ({
      error: jest.fn(),
      json: jest.fn(),
      redirect: jest.fn()
    }) as unknown as Response
);

// mock loaders.gl version
(global as any)._loadersgl_ = {version: '4.2.1'};

// mock d3-array
jest.mock('d3-array', () => ({
  quantile: jest.fn(),
  median: jest.fn(),
  mean: jest.fn()
}));

// fix the issue that File instance doesn't have arrayBuffer method in Jest
// https://github.com/jsdom/jsdom/issues/3206
// import { Blob as BlobPolyfill } from 'node:buffer';
// global.Blob = BlobPolyfill as any;
function readType(input: string = ''): string {
  const type = String(input).toLowerCase();
  return /[^\u0020-\u007E]/.test(type) ? '' : type;
}

export class BlobPolyfill extends Blob {
  // implements Blob {
  /** The MIME type of the data contained in the Blob. If type is unknown, string is empty. */
  readonly mimeType: string;
  /** The size, in bytes, of the data contained in the Blob object. */
  byteSize: number;
  private parts: Uint8Array[];

  get size() {
    return this.byteSize;
  }

  get type() {
    return this.mimeType;
  }

  /**
   * @param [init]
   * @param [options]
   */
  constructor(init: BlobPart[] = [], options: BlobPropertyBag = {}) {
    super();
    this.parts = [];

    this.byteSize = 0;
    for (const part of init) {
      if (typeof part === 'string') {
        const bytes = new TextEncoder().encode(part);
        this.parts.push(bytes);
        this.byteSize += bytes.byteLength;
      } else if (part instanceof BlobPolyfill) {
        this.byteSize += part.byteSize;
        // @ts-ignore - `parts` is marked private so TS will complain about
        // accessing it.
        this.parts.push(...part.parts);
      } else if (part instanceof ArrayBuffer) {
        this.parts.push(new Uint8Array(part));
        this.byteSize += part.byteLength;
      } else if (part instanceof Uint8Array) {
        this.parts.push(part);
        this.byteSize += part.byteLength;
      } else if (ArrayBuffer.isView(part)) {
        const {buffer, byteOffset, byteLength} = part;
        this.parts.push(new Uint8Array(buffer, byteOffset, byteLength));
        this.byteSize += byteLength;
      } else {
        const bytes = new TextEncoder().encode(String(part));
        this.parts.push(bytes);
        this.byteSize += bytes.byteLength;
      }
    }

    /** @private */
    this.mimeType = readType(options.type);
  }

  /**
   * Returns a new Blob object containing the data in the specified range of
   * bytes of the blob on which it's called.
   * @param start=0 - An index into the Blob indicating the first
   * byte to include in the new Blob. If you specify a negative value, it's
   * treated as an offset from the end of the Blob toward the beginning. For
   * example, `-10` would be the 10th from last byte in the Blob. The default
   * value is `0`. If you specify a value for start that is larger than the
   * size of the source Blob, the returned Blob has size 0 and contains no
   * data.
   * @param end - An index into the `Blob` indicating the first byte
   *  that will *not* be included in the new `Blob` (i.e. the byte exactly at
   * this index is not included). If you specify a negative value, it's treated
   * as an offset from the end of the Blob toward the beginning. For example,
   * `-10` would be the 10th from last byte in the `Blob`. The default value is
   * size.
   * @param type - The content type to assign to the new Blob;
   * this will be the value of its type property. The default value is an empty
   * string.
   */
  slice(start: number = 0, end: number = this.byteSize, type: string = ''): Blob {
    const {byteSize: size, parts: parts} = this;
    let offset = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);

    let limit = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
    const span = Math.max(limit - offset, 0);
    const blob = new BlobPolyfill([], {type});

    if (span === 0) {
      // @ts-ignore
      return blob;
    }

    let blobSize = 0;
    const blobParts: Uint8Array[] = [];
    for (const part of parts) {
      const {byteLength} = part;
      if (offset > 0 && byteLength <= offset) {
        offset -= byteLength;
        limit -= byteLength;
      } else {
        const chunk = part.subarray(offset, Math.min(byteLength, limit));
        blobParts.push(chunk);
        blobSize += chunk.byteLength;
        // no longer need to take that into account
        offset = 0;

        // don't add the overflow to new blobParts
        if (blobSize >= span) {
          break;
        }
      }
    }

    blob.parts = blobParts;
    blob.byteSize = blobSize;

    // @ts-ignore
    return blob;
  }

  /**
   * Returns a promise that resolves with an ArrayBuffer containing the entire
   * contents of the Blob as binary data.
   */
  // eslint-disable-next-line require-await
  async arrayBuffer(): Promise<ArrayBuffer> {
    return this._toArrayBuffer();
  }

  /**
   * Returns a promise that resolves with a USVString containing the entire
   * contents of the Blob interpreted as UTF-8 text.
   */
  // eslint-disable-next-line require-await
  async text(): Promise<string> {
    const decoder = new TextDecoder();
    let text = '';
    for (const part of this.parts) {
      text += decoder.decode(part);
    }
    return text;
  }

  /**
   */
  // @ts-ignore
  stream(): any {
    // return new BlobStream<any>(this.parts);
  }

  /**
   * @returns {string}
   */
  toString() {
    return '[object Blob]';
  }

  get [Symbol.toStringTag]() {
    return 'Blob';
  }

  _toArrayBuffer(): ArrayBuffer {
    const buffer = new ArrayBuffer(this.byteSize);
    const bytes = new Uint8Array(buffer);
    let offset = 0;
    for (const part of this.parts) {
      bytes.set(part, offset);
      offset += part.byteLength;
    }
    return buffer;
  }
}

export class FilePolyfill extends BlobPolyfill {
  // implements File {
  // public API
  /** The name of the file referenced by the File object. */
  name: string = '';
  /** The path the URL of the File is relative to. */
  webkitRelativePath: string = '';

  /**
   * Returns the last modified time of the file, in millisecond since the UNIX
   * epoch (January 1st, 1970 at Midnight).
   */
  lastModified: number;

  /**
   * @param init
   * @param name - A USVString representing the file name or the path
   * to the file.
   * @param [options]
   */
  constructor(init: BlobPart[], name: string, options: FilePropertyBag = {}) {
    super(init, options);
    // Per File API spec https://w3c.github.io/FileAPI/#file-constructor
    // Every "/" character of file name must be replaced with a ":".
    /** @private */
    this.name = String(name).replace(/\//g, ':');
    /** @private */
    this.lastModified = options?.lastModified || Date.now();
  }

  get [Symbol.toStringTag]() {
    return 'File';
  }
}

global.Blob = BlobPolyfill;
global.File = FilePolyfill;
