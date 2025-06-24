/**
 * Global type declarations for the project
 */

// Declare global fetch API for Node.js environment
declare global {
  // Fetch API types
  type RequestInfo = Request | string;
  type RequestInit = {
    method?: string;
    headers?: Record<string, string>;
    body?: string | null;
    mode?: string;
    credentials?: string;
    cache?: string;
    redirect?: string;
    referrer?: string;
    referrerPolicy?: string;
    integrity?: string;
    keepalive?: boolean;
    signal?: AbortSignal | null;
  };

  // Node.js globals
  function setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): NodeJS.Timeout;
  function clearTimeout(timeoutId: NodeJS.Timeout): void;
  function setImmediate(callback: (...args: any[]) => void, ...args: any[]): NodeJS.Immediate;
  function clearImmediate(immediateId: NodeJS.Immediate): void;
  
  // Console API
  const console: Console;
  
  // Process API
  const process: NodeJS.Process;
  
  // URL API
  class URL {
    constructor(url: string, base?: string | URL);
    hash: string;
    host: string;
    hostname: string;
    href: string;
    origin: string;
    password: string;
    pathname: string;
    port: string;
    protocol: string;
    search: string;
    searchParams: URLSearchParams;
    username: string;
    toString(): string;
    toJSON(): string;
  }
  
  class URLSearchParams {
    constructor(init?: string | Record<string, string> | string[][] | URLSearchParams);
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string | null;
    getAll(name: string): string[];
    has(name: string): boolean;
    set(name: string, value: string): void;
    sort(): void;
    toString(): string;
    forEach(callback: (value: string, name: string, searchParams: URLSearchParams) => void): void;
  }
  
  // Fetch API
  function fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
  
  class Response {
    constructor(body?: BodyInit | null, init?: ResponseInit);
    readonly headers: Headers;
    readonly ok: boolean;
    readonly redirected: boolean;
    readonly status: number;
    readonly statusText: string;
    readonly type: ResponseType;
    readonly url: string;
    clone(): Response;
    json(): Promise<any>;
    text(): Promise<string>;
  }
  
  type ResponseType = 'basic' | 'cors' | 'default' | 'error' | 'opaque' | 'opaqueredirect';
  
  interface ResponseInit {
    headers?: HeadersInit;
    status?: number;
    statusText?: string;
  }
  
  type HeadersInit = Headers | string[][] | Record<string, string>;
  type BodyInit = Blob | BufferSource | FormData | URLSearchParams | ReadableStream | string;
}
