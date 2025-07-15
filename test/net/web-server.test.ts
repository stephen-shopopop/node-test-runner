import type http from 'node:http';
import it, { afterEach, describe, type TestContext } from 'node:test';
import { Writable } from 'node:stream';
import {
  buildContext,
  buildOutgoingHttpHeaders,
  closeWebServer,
  createWebServer,
  handleResponseError,
  parseAndCoerceHeaders,
  safeJsonParse,
  writeFromReadableStream
} from '../../src/net/web-server.js';

describe('web-server', () => {
  describe('parseAndCoerceHeaders', () => {
    it('should parse raw headers into key-value pairs', (t: TestContext) => {
      t.plan(1);

      // Arrange
      const rawHeaders = ['Content-Type', 'application/json', 'X-Test', '123'];

      // Act
      const result = parseAndCoerceHeaders(rawHeaders);

      // Assert
      t.assert.deepStrictEqual(result, [
        ['Content-Type', 'application/json'],
        ['X-Test', '123']
      ]);
    });

    it('should skip pseudo headers', (t: TestContext) => {
      t.plan(1);

      // Arrange
      const rawHeaders = [':pseudo', 'value', 'X-Test', 'abc'];

      // Act
      const result = parseAndCoerceHeaders(rawHeaders);

      // Assert
      t.assert.deepStrictEqual(result, [['X-Test', 'abc']]);
    });
  });

  describe('buildOutgoingHttpHeaders', () => {
    it('should convert Headers to OutgoingHttpHeaders', (t: TestContext) => {
      t.plan(2);

      // Arrange
      const headers = new Headers([['x-foo', 'bar']]);

      // Act
      const result = buildOutgoingHttpHeaders(headers);

      // Assert
      t.assert.strictEqual(result['x-foo'], 'bar');
      t.assert.strictEqual(result['content-type'], 'text/plain; charset=UTF-8');
    });

    it('should not override content-type if already set', (t: TestContext) => {
      t.plan(1);

      // Arrange
      const headers = new Headers([['content-type', 'application/json']]);

      // Act
      const result = buildOutgoingHttpHeaders(headers);

      // Assert
      t.assert.strictEqual(result['content-type'], 'application/json');
    });
  });

  describe('createWebServer and closeWebServer', () => {
    let server: http.Server | undefined;

    afterEach(async () => {
      // Clean state
      await closeWebServer(server);

      server = undefined;
    });

    it('should create a server and respond to GET requests', async (t: TestContext) => {
      t.plan(2);

      // Arrange
      const { server: srv, address } = await createWebServer({
        port: 0,
        fetchCallback: (ctx) => {
          if (ctx.method === 'GET' && ctx.path === '/') {
            return new Response('Hello World', { status: 200 });
          }

          return new Response('Not Found', { status: 404 });
        }
      });

      server = srv;

      // Act
      const res = await fetch(`http://127.0.0.1:${address.port}/`);

      // Assert
      t.assert.strictEqual(res.status, 200);
      const text = await res.text();
      t.assert.strictEqual(text, 'Hello World');
    });

    it('should handle POST requests with JSON body', async (t: TestContext) => {
      t.plan(2);

      // Arrange
      const { server: srv, address } = await createWebServer({
        port: 0,
        fetchCallback: async (ctx) => {
          if (ctx.method === 'POST' && ctx.path === '/data') {
            return new Response(JSON.stringify(await ctx.body()), {
              status: 200,
              headers: { 'content-type': 'application/json' }
            });
          }
          return new Response('Not Found', { status: 404 });
        }
      });

      server = srv;

      // Act
      const res = await fetch(`http://127.0.0.1:${address.port}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foo: 'bar' })
      });

      // Assert
      t.assert.strictEqual(res.status, 200);
      const json = await res.json();
      t.assert.deepStrictEqual(json, { foo: 'bar' });
    });

    it('should close the server gracefully', async (t: TestContext) => {
      t.plan(1);

      // Arrange
      const { server: srv } = await createWebServer({
        port: 0,
        fetchCallback: () => new Response('OK')
      });

      server = srv;

      // Act
      const webServerClosed = await closeWebServer(server);

      // Assert
      t.assert.strictEqual(webServerClosed, undefined);
    });
  });

  describe('safeJsonParse', () => {
    it('should safely parse valid JSON strings', (t: TestContext) => {
      t.plan(1);

      // Arrange
      const jsonString = '{"foo": "bar", "baz": 123}';

      // Act
      const result = safeJsonParse(jsonString);

      // Act && Assert
      t.assert.deepStrictEqual(result, { foo: 'bar', baz: 123 });
    });

    it('should return original string if JSON parsing fails', (t: TestContext) => {
      t.plan(1);

      // Arrange
      const invalidJsonString = '{foo: bar}';

      // Act
      const result = safeJsonParse(invalidJsonString);

      // Act && Assert
      t.assert.strictEqual(result, invalidJsonString);
    });

    describe('buildContext', () => {
      it('should build context from a Request with JSON body', async (t: TestContext) => {
        t.plan(5);

        // Arrange
        const url = 'http://localhost:8080/test?foo=bar&baz=42';
        const bodyObj = { hello: 'world', num: 123 };
        const req = new Request(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Custom': 'abc' },
          body: JSON.stringify(bodyObj)
        });

        // Act
        const ctx = await buildContext(req);

        // Assert
        t.assert.strictEqual(ctx.method, 'POST');
        t.assert.deepStrictEqual(ctx.headers, {
          'content-type': 'application/json',
          'x-custom': 'abc'
        });
        t.assert.strictEqual(ctx.path, '/test');
        t.assert.deepStrictEqual(ctx.query, { foo: 'bar', baz: '42' });
        t.assert.deepStrictEqual(await ctx.body(), bodyObj);
      });

      it('should handle non-JSON body gracefully', async (t: TestContext) => {
        t.plan(1);

        // Arrange
        const req = new Request('http://localhost:8080/echo', {
          method: 'POST',
          body: 'plain text'
        });

        // Act
        const ctx = await buildContext(req);

        // Assert
        t.assert.strictEqual(await ctx.body(), 'plain text');
      });

      it('should handle empty body', async (t: TestContext) => {
        t.plan(1);

        // Arrange
        const req = new Request('http://localhost:8080/empty', {
          method: 'GET'
        });

        // Act
        const ctx = await buildContext(req);

        // Assert
        t.assert.strictEqual(await ctx.body(), '');
      });

      it('should parse query parameters correctly', async (t: TestContext) => {
        t.plan(1);

        // Arrange
        const req = new Request('http://localhost:8080/path?x=1&y=2', {
          method: 'GET'
        });

        // Act
        const ctx = await buildContext(req);

        // Assert
        t.assert.deepStrictEqual(ctx.query, { x: '1', y: '2' });
      });
    });

    describe('handleResponseError', () => {
      it('should log info and not send headers if error code is ERR_STREAM_PREMATURE_CLOSE', (t: TestContext) => {
        t.plan(2);

        // Arrange
        const logs: string[] = [];
        const infos: string[] = [];
        const originalError = console.error;
        const originalInfo = console.info;
        console.error = (msg) => logs.push(String(msg));
        console.info = (msg) => infos.push(String(msg));

        const outgoing = {
          headersSent: false,
          writeHead: () => {
            throw new Error('Should not be called');
          },
          end: () => {},
          destroy: () => {}
        } as unknown as http.ServerResponse;

        // Act
        handleResponseError(
          Object.assign(new Error('closed'), { code: 'ERR_STREAM_PREMATURE_CLOSE' }),
          outgoing
        );

        // Assert
        t.assert.strictEqual(infos[0], 'The user aborted a request.');
        t.assert.strictEqual(logs.length, 0);

        // Cleanup
        console.error = originalError;
        console.info = originalInfo;
      });

      it('should log error, send 500 if headers not sent, and destroy response', (t: TestContext) => {
        t.plan(4);

        // Arrange
        let writeHeadCalled = false;
        let endCalled = false;
        let destroyCalled = false;
        let errorLogged: unknown;

        const originalError = console.error;
        const originalInfo = console.info;
        console.error = (msg) => {
          errorLogged = msg;
        };
        console.info = () => {};

        const outgoing = {
          headersSent: false,
          writeHead: (status: number, headers: unknown) => {
            // biome-ignore lint/suspicious/noExplicitAny: use for testing
            writeHeadCalled = status === 500 && (headers as any)['Content-Type'] === 'text/plain';
          },
          end: (msg?: unknown) => {
            endCalled = typeof msg === 'string' && (msg as string).startsWith('Error:');
          },
          destroy: () => {
            destroyCalled = true;
          }
        } as unknown as http.ServerResponse;

        // Act
        const err = new Error('fail');
        handleResponseError(err, outgoing);

        // Assert
        t.assert.strictEqual(writeHeadCalled, true);
        t.assert.strictEqual(endCalled, true);
        t.assert.strictEqual(destroyCalled, true);
        t.assert.strictEqual(errorLogged, err);

        // Cleanup
        console.error = originalError;
        console.info = originalInfo;
      });

      it('should not call writeHead if headers already sent', (t: TestContext) => {
        t.plan(3);

        // Arrange
        let writeHeadCalled = false;
        let endCalled = false;
        let destroyCalled = false;

        const originalError = console.error;
        console.error = () => {};

        const outgoing = {
          headersSent: true,
          writeHead: () => {
            writeHeadCalled = true;
          },
          end: () => {
            endCalled = true;
          },
          destroy: () => {
            destroyCalled = true;
          }
        } as unknown as http.ServerResponse;

        // Act
        handleResponseError(new Error('fail'), outgoing);

        // Assert
        t.assert.strictEqual(writeHeadCalled, false);
        t.assert.strictEqual(endCalled, true);
        t.assert.strictEqual(destroyCalled, true);

        // Cleanup
        console.error = originalError;
      });
    });

    describe('writeFromReadableStream', () => {
      it('should write all chunks from ReadableStream to Writable', async (t: TestContext) => {
        t.plan(1);

        // Arrange
        const chunks = [new Uint8Array([1, 2]), new Uint8Array([3, 4])];
        const written: Uint8Array[] = [];
        const writable = new Writable({
          write(chunk, _enc, cb) {
            written.push(chunk);
            cb();
          }
        });

        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            for (const chunk of chunks) {
              controller.enqueue(chunk);
            }
            controller.close();
          }
        });

        // Act
        await writeFromReadableStream(stream, writable);

        // Assert
        t.assert.strictEqual(writable.writableEnded, true);
      });

      it('should throw if ReadableStream is locked', (t: TestContext) => {
        t.plan(1);

        // Arrange
        const stream = new ReadableStream<Uint8Array>();
        // Lock the stream
        stream.getReader();

        const writable = new Writable({
          write(_chunk, _enc, cb) {
            cb();
          }
        });

        // Act & Assert
        t.assert.throws(() => writeFromReadableStream(stream, writable), {
          name: 'TypeError',
          message: 'ReadableStream is locked.'
        });
      });

      it('should cancel stream and return if writable is destroyed', async (t: TestContext) => {
        t.plan(1);

        // Arrange
        let cancelled = false;
        const stream = new ReadableStream<Uint8Array>({
          cancel() {
            cancelled = true;
          }
        });

        const writable = new Writable();
        writable.destroyed = true;

        // Act
        await writeFromReadableStream(stream, writable);

        // Assert
        t.assert.strictEqual(cancelled, true);
      });

      it('should handle backpressure (drain event)', async (t: TestContext) => {
        t.plan(1);

        // Arrange
        const chunks = [new Uint8Array([1]), new Uint8Array([2])];
        const written: Uint8Array[] = [];
        let writeCount = 0;

        const writable = new Writable({
          write(chunk, _enc, cb) {
            written.push(chunk);
            writeCount++;
            // Simulate backpressure on first write
            if (writeCount === 1) {
              // Don't call cb immediately, simulate full buffer
              setTimeout(cb, 10);
              return false;
            }
            cb();
            return true;
          }
        });

        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            for (const chunk of chunks) {
              controller.enqueue(chunk);
            }
            controller.close();
          }
        });

        // Act
        await writeFromReadableStream(stream, writable);

        // Assert
        t.assert.strictEqual(writable.writableEnded, true);
      });

      it('should end writable and cancel reader if writable emits error', async (t: TestContext) => {
        t.plan(2);

        // Arrange
        let cancelled = false;
        let destroyed = false;
        const stream = new ReadableStream<Uint8Array>({
          cancel() {
            cancelled = true;
          },
          start(controller) {
            controller.enqueue(new Uint8Array([1, 2, 3]));
          }
        });

        const writable = new Writable({
          write(_chunk, _enc, cb) {
            cb();
          }
        });

        writable.on('error', () => {
          destroyed = true;
        });

        // Simulate error after a tick
        setImmediate(() => {
          writable.emit('error', new Error('fail'));
        });

        // Act
        await writeFromReadableStream(stream, writable);

        // Assert
        t.assert.strictEqual(cancelled, true);
        t.assert.strictEqual(destroyed, true);
      });

      it('should end writable when readable stream is done', async (t: TestContext) => {
        t.plan(1);

        // Arrange
        let ended = false;
        const writable = new Writable({
          write(_chunk, _enc, cb) {
            cb();
          },
          final(cb) {
            ended = true;
            cb();
          }
        });

        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            controller.close();
          }
        });

        // Act
        await writeFromReadableStream(stream, writable);

        // Assert
        t.assert.strictEqual(ended, true);
      });

      it('should remove event listeners after completion', async (t: TestContext) => {
        t.plan(2);

        // Arrange
        const writable = new Writable({
          write(_chunk, _enc, cb) {
            cb();
          }
        });

        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(new Uint8Array([1]));
            controller.close();
          }
        });

        // Act
        await writeFromReadableStream(stream, writable);

        // Assert
        // There should be no 'close' or 'error' listeners left
        t.assert.strictEqual(writable.listenerCount('close'), 0);
        t.assert.strictEqual(writable.listenerCount('error'), 0);
      });

      it('should not write if writable is destroyed before reading', async (t: TestContext) => {
        t.plan(2);

        // Arrange
        let written = false;
        const writable = new Writable({
          write(_chunk, _enc, cb) {
            written = true;
            cb();
          }
        });
        writable.destroyed = true;

        let cancelled = false;

        const stream = new ReadableStream<Uint8Array>({
          cancel() {
            cancelled = true;
          }
        });

        // Act
        await writeFromReadableStream(stream, writable);

        // Assert
        t.assert.strictEqual(written, false);
        t.assert.strictEqual(cancelled, true);
      });
    });
  });
});
