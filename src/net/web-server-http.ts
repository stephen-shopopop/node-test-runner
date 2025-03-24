import type { OutgoingHttpHeaders, Server } from 'node:http';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { Readable } from 'node:stream';

export type FetchCallback = (request: Request) => Promise<Response> | Response;

interface Options {
  /** Use default value = 0 */
  port?: number;
  fetchCallback: FetchCallback;
}

export const parseAndCoerceHeaders = (rawHeaders: Readonly<string[]>): [string, string][] => {
  const headers: [string, string][] = [];

  for (let i = 0; i < rawHeaders.length; i += 2) {
    const { [i]: key, [i + 1]: value } = rawHeaders;

    if (key && key.charCodeAt(0) !== /*:*/ 0x3a && value !== undefined) {
      headers.push([key, value]);
    }
  }

  return headers;
};

export const buildOutgoingHttpHeaders = (headers: Readonly<Headers>): OutgoingHttpHeaders => {
  const res: OutgoingHttpHeaders = {};

  for (const [k, v] of headers) {
    res[k] = v;
  }

  res['content-type'] ??= 'text/plain; charset=UTF-8';

  return res;
};

const handleResponseError = (e: unknown, outgoing: Readonly<http.ServerResponse>) => {
  const err = (e instanceof Error ? e : new Error('unknown error', { cause: e })) as Error & {
    code: string;
  };

  if (err.code === 'ERR_STREAM_PREMATURE_CLOSE') {
    console.info('The user aborted a request.');
  } else {
    console.error(e);

    if (!outgoing.headersSent) {
      outgoing.writeHead(500, { 'Content-Type': 'text/plain' });
    }

    outgoing.end(`Error: ${err.message}`);
    outgoing.destroy(err);
  }
};

const getRequestListener = (fetchCallback: FetchCallback) => {
  return async (
    incoming: Readonly<http.IncomingMessage>,
    outgoing: Readonly<http.ServerResponse>
  ) => {
    let body: ReadableStream<Uint8Array<ArrayBufferLike>> | null = null;

    if (!(incoming.method === 'GET' || incoming.method === 'HEAD')) {
      body = Readable.toWeb(incoming) as ReadableStream<Uint8Array>;
    }

    const request = new Request(`http://${incoming.headers.host}${incoming.url}`, {
      method: incoming.method || 'GET',
      headers: parseAndCoerceHeaders(incoming.rawHeaders),
      body,
      duplex: 'half'
    });

    try {
      const res = await fetchCallback(request);

      if (res.body) {
        const buffer = await res.arrayBuffer();
        res.headers.set('Content-Length', buffer.byteLength.toString());

        outgoing.writeHead(res.status, buildOutgoingHttpHeaders(res.headers));
        outgoing.end(new Uint8Array(buffer));
      } else {
        outgoing.writeHead(res.status, buildOutgoingHttpHeaders(res.headers));
        outgoing.end();
      }
    } catch (e) {
      return handleResponseError(e, outgoing);
    }
  };
};

/**
 * Create web server
 *
 * - Request: https://developer.mozilla.org/en-US/docs/Web/API/Request
 * - Headers: https://developer.mozilla.org/en-US/docs/Web/API/Headers
 * - Response: https://developer.mozilla.org/en-US/docs/Web/API/Response
 *
 *  ## Example
 *
 * ```ts
 * const server = await createWebServer({
 *   port: 9000,
 *   fetchCallback: (request) => {
 *      const method = ctx.method; // GET, POST, ...
 *      const headers = Object.fromEntries(ctx.headers);
 *      const path = new URL(ctx.url).pathname;
 *      const query = Object.fromEntries(new URL(ctx.url).searchParams);
 *      const payload = Buffer.from(await ctx.arrayBuffer()).toString();
 *
 *      console.log({ method, path, query, headers, payload });
 *
 *      return new Response('OK');
 *   }
 * });
 * ```
 */
export const createWebServer = async ({
  port,
  fetchCallback
}: Options): Promise<{ server: Server; address: AddressInfo }> => {
  const server = http.createServer(getRequestListener(fetchCallback));

  return await new Promise((resolve) => {
    server.listen(port, () => {
      const address = server.address() as AddressInfo;

      resolve({ server, address });
    });
  });
};

/**
 * Close web server
 *
 *  ## Example
 *
 * ```ts
 * const server = await createWebServer({
 *   port: 9000,
 *   fetchCallback: () => new Response()
 * });
 *
 * await closeWebServer(server); // Server is closed
 * ```
 */
export const closeWebServer = async (server: Server | undefined): Promise<void> =>
  await new Promise<void>((resolve) => {
    if (server !== undefined) {
      server.close(() => {
        resolve();
      });
    }
  });
