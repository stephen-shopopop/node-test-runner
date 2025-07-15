/**
 * Represents the context of an HTTP request.
 *
 * @property method - The HTTP method (e.g., 'GET', 'POST').
 * @property headers - A record of HTTP headers associated with the request.
 * @property path - The request path (URL endpoint).
 * @property query - An object containing query parameters from the URL.
 * @property body - A function that returns a promise resolving to the parsed request body.
 */
export type Context = {
  method: string;
  headers: Record<string, string>;
  path: string;
  query: Record<string, string>;
  body: () => Promise<unknown>;
};

/**
 * Represents a callback function to handle HTTP requests in a web server context.
 *
 * @param request - The context object representing the incoming HTTP request.
 * @returns A `Response` object or a `Promise` that resolves to a `Response`.
 */
export type FetchCallback = (request: Context) => Promise<Response> | Response;

/**
 * Configuration options for the web server.
 *
 * @property port - The port number on which the server will listen. Defaults to 0 if not specified.
 * @property fetchCallback - A callback function to handle fetch requests.
 */
export type WebServerOptions = {
  /** Use default value = 0 */
  port?: number;
  fetchCallback: FetchCallback;
};
