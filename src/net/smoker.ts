import { createHash } from 'node:crypto';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { closeWebServer, createWebServer } from './web-server-http.js';

type Context = {
  method: string;
  headers: Record<string, string>;
  path: string;
  query: Record<string, unknown>;
  body: unknown;
};

type Mock = {
  request: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';
    path: string;
  };
  response?: Partial<{
    status: number;
    headers: Record<string, string>;
    body: string;
  }>;
};

type History = {
  mock_id: string;
  request: Context & { datetime: number };
  response?: Mock['response'];
};

const safeJsonParse = (data: string): unknown => {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

const buildContext = async (request: Request): Promise<Context> =>
  Object.freeze({
    method: request.method,
    headers: Object.fromEntries(request.headers),
    path: new URL(request.url).pathname,
    query: Object.fromEntries(new URL(request.url).searchParams),
    body: safeJsonParse(Buffer.from(await request.arrayBuffer()).toString())
  });

const buildResponse = (mock: Mock | undefined): Response => {
  if (mock) {
    return new Response(mock.response?.body, {
      status: mock.response?.status ?? 200,
      headers: mock.response?.headers ?? {}
    });
  }

  return new Response();
};

export class Smoker {
  #history: History[];
  #recorder: Map<string, Context & { datetime: number }>;
  #mock: Map<string, Mock>;
  #server: Server | undefined;
  #address: AddressInfo | undefined;

  constructor(private readonly port: number) {
    this.#recorder = new Map();
    this.#mock = new Map();
    this.#history = [];
  }

  #setRecord(identifier: string, ctx: Readonly<Context>): void {
    this.#recorder.set(identifier, { ...ctx, datetime: Date.now() });
  }

  /**
   * Get all records from all requests
   */
  getRecords() {
    return [...this.#recorder].flatMap(([id, request]) => [{ id, request }]);
  }

  #setHistory(mockId: string, ctx: Readonly<Context>): void {
    this.#history.push({
      mock_id: mockId,
      request: { ...ctx, datetime: Date.now() },
      response: this.#mock.get(mockId)?.response
    });
  }

  /**
   * Get history from mock requests
   *
   * It's possible to filter by mock_id
   */
  getHistory(mock_id?: string) {
    return mock_id ? this.#history.filter((item) => item.mock_id === mock_id) : this.#history;
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.#recorder.clear();
    this.#history = [];
  }

  #uniqueId(data: `${string}:${string}`): string {
    return createHash('sha1').update(data).digest('hex');
  }

  /**
   * Add mock request
   */
  addMock(mock: Mock): string {
    const uniqueId = this.#uniqueId(`${mock.request.method}:${mock.request.path}`);

    this.#mock.set(uniqueId, mock);

    return uniqueId;
  }

  async #fetchCallback(request: Request): Promise<Response> {
    const ctx = await buildContext(request);
    const pattern = this.#uniqueId(`${ctx.method}:${ctx.path}`);

    if (this.#mock.has(pattern)) {
      this.#setHistory(pattern, ctx);
    }

    this.#setRecord(pattern, ctx);

    return buildResponse(this.#mock.get(pattern));
  }

  /**
   * Start smoker server
   */
  async start(): Promise<Smoker> {
    const { server, address } = await createWebServer({
      port: this.port,
      fetchCallback: (request) => this.#fetchCallback(request)
    });

    this.#server = server;
    this.#address = address;

    return this;
  }

  /**
   * Destroy smoker
   */
  async destroy(): Promise<void> {
    this.clearHistory();

    await closeWebServer(this.#server);
  }

  /**
   * Get address information smoker server
   */
  getAddressInfo(): AddressInfo | undefined {
    return this.#address;
  }
}
