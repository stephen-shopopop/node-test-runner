import { createHash } from 'node:crypto';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { closeWebServer, createWebServer } from './web-server.js';
import type { Context } from '../definitions.js';

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
  request: Omit<Context, 'body'> & { body: unknown; datetime: number };
  response?: Mock['response'];
};

/**
 * Build a Response object from a mock
 * @param mock Mock object containing request and optional response
 * @returns Response object
 */
const buildResponse = (mock: Mock | undefined): Response => {
  if (mock) {
    return new Response(mock.response?.body, {
      status: mock.response?.status ?? 200,
      headers: mock.response?.headers ?? {}
    });
  }

  return new Response();
};

/**
 * Smoker is a mock server for testing HTTP requests
 * and responses.
 * It allows you to record requests, mock responses,
 * and retrieve request history.
 */
export class Smoker {
  #history: History[];
  #recorder: Map<string, Omit<Context, 'body'> & { body: unknown; datetime: number }>;
  #mock: Map<string, Mock>;
  #server: Server | undefined;
  #address: AddressInfo | undefined;

  constructor(private readonly port: number) {
    this.#recorder = new Map();
    this.#mock = new Map();
    this.#history = [];
  }

  #setRecord(identifier: string, ctx: Readonly<Omit<Context, 'body'> & { body: unknown }>): void {
    this.#recorder.set(identifier, { ...ctx, datetime: Date.now() });
  }

  /**
   * Get all records from all requests
   * This method retrieves all recorded requests made to the mock server.
   * Each record contains the request details, including the identifier,
   * method, path, and any additional context information.
   *
   * @returns Array of records
   */
  getRecords() {
    return [...this.#recorder].flatMap(([id, request]) => [{ id, request }]);
  }

  #setHistory(mockId: string, ctx: Readonly<Omit<Context, 'body'> & { body: unknown }>): void {
    this.#history.push({
      mock_id: mockId,
      request: { ...ctx, datetime: Date.now() },
      response: this.#mock.get(mockId)?.response
    });
  }

  /**
   * Get history from mock requests
   * This method retrieves the history of requests made to the mock server.
   * It returns an array of history entries, each containing the mock ID,
   * request details, and optional response data.
   *
   * @param mock_id Optional mock ID to filter history
   * If provided, only history entries matching the mock_id will be returned.
   * If not provided, all history entries will be returned.
   * @returns Array of history entries
   */
  getHistory(mock_id?: string) {
    return mock_id ? this.#history.filter((item) => item.mock_id === mock_id) : this.#history;
  }

  /**
   * Clear history of requests
   * This method clears the recorded history of requests made to the mock server.
   * It removes all entries from the history array and resets the recorder.
   * After calling this method, the history will be empty, and all recorded requests
   * will be discarded.
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
   * This method allows you to define a mock request
   * with a specific HTTP method and path, along with
   * an optional response object.
   *
   * @param mock Mock object containing request and optional response
   * @param mock.request.method HTTP method (GET, POST, etc.)
   * @param mock.request.path Request path to match
   * @param mock.response Optional response object containing status, headers, and body
   * @param mock.response.status HTTP status code for the response
   * @param mock.response.headers Optional headers for the response
   * @param mock.response.body Optional body content for the response
   * @returns
   */
  addMock(mock: Mock): string {
    const uniqueId = this.#uniqueId(`${mock.request.method}:${mock.request.path}`);

    this.#mock.set(uniqueId, mock);

    return uniqueId;
  }

  async #fetchCallback(ctx: Context): Promise<Response> {
    const pattern = this.#uniqueId(`${ctx.method}:${ctx.path}`);
    const body = await ctx.body();

    if (this.#mock.has(pattern)) {
      this.#setHistory(pattern, { ...ctx, body });
    }

    this.#setRecord(pattern, { ...ctx, body });

    return buildResponse(this.#mock.get(pattern));
  }

  /**
   *  Start smoker server
   *  This method initializes the smoker server, allowing it to listen for incoming HTTP requests.
   *  It sets up the server to handle requests using the provided fetch callback.
   * @returns
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
   * Destroy smoker server
   * This method stops the smoker server and clears its history.
   */
  async destroy(): Promise<void> {
    this.clearHistory();

    await closeWebServer(this.#server);
  }

  /**
   *  Get address information of the smoker server
   *  This method retrieves the address information of the smoker server, including the port and address.
   *  It returns an AddressInfo object if the server is running, or undefined if the server is not started.
   * @returns AddressInfo | undefined
   */
  getAddressInfo(): AddressInfo | undefined {
    return this.#address;
  }
}
