import { net } from '#runner';
import test, { after, describe, it, type TestContext } from 'node:test';
import { buildOutgoingHttpHeaders, parseAndCoerceHeaders } from '../../src/net/web-server-http.js';

describe('Net createWebServer #net #server', () => {
  describe('parseAndCoerceHeaders', () => {
    it('Should return [] when parse header with header key = ":"', async (t: TestContext) => {
      // Act
      const headers = parseAndCoerceHeaders([':', 'test']);

      // Expect
      t.assert.deepStrictEqual(headers, []);
    });

    it('Should return Headers when parse header ', async (t: TestContext) => {
      // Act
      const headers = parseAndCoerceHeaders(['host', 'localhost:9000']);

      // Expect
      t.assert.deepStrictEqual(headers, [['host', 'localhost:9000']]);
    });

    it('Should return [] when parse header without value', async (t: TestContext) => {
      // Act
      const headers = parseAndCoerceHeaders(['host']);

      // Expect
      t.assert.deepStrictEqual(headers, []);
    });
  });

  describe('buildOutgoingHttpHeaders', () => {
    it('Should outgoingHttpHeaders with content-type = text/plain; charset=UTF-8', async (t: TestContext) => {
      // Arrange
      const headers = new Headers();

      // Act
      const outgoingHttpHeaders = buildOutgoingHttpHeaders(headers);

      // Expect
      t.assert.deepStrictEqual(outgoingHttpHeaders, {
        'content-type': 'text/plain; charset=UTF-8'
      });
    });

    it('Should outgoingHttpHeaders with content-type = text/plain; charset=UTF-8', async (t: TestContext) => {
      // Arrange
      const headers = new Headers([['Content-Type', 'application/json']]);

      // Act
      const outgoingHttpHeaders = buildOutgoingHttpHeaders(headers);

      // Expect
      t.assert.deepStrictEqual(outgoingHttpHeaders, {
        'content-type': 'application/json'
      });
    });
  });

  describe('createWebServer is reachable', () => {
    it('Should return server is reachable', async (t: TestContext) => {
      after(async () => {
        // Clean state
        await server.close();
      });

      // Arrange
      const { server, address } = await net.createWebServer({
        fetchCallback: () => new Response()
      });

      // Act
      const value = await net.isPortReachable(address.port);

      // Expect
      t.assert.equal(value, true);
    });
  });

  describe('createWebServer custom header', () => {
    it('Should return response with custom header', async (t: TestContext) => {
      after(async () => {
        // Clean state
        await server.close();
      });

      // Arrange
      const { server, address } = await net.createWebServer({
        fetchCallback: () =>
          new Response(null, {
            headers: [
              ['X-Time-Process', '24'],
              ['Content-Type', 'application/json']
            ]
          })
      });

      // Act
      const response = await fetch(`http://localhost:${address.port}`);

      // Expect
      t.assert.equal(response.status, 200);
      t.assert.equal(response.statusText, 'OK');
      t.assert.equal(response.headers.get('x-time-process'), '24');
      t.assert.equal(response.headers.get('Content-Type'), 'application/json');
    });
  });

  describe('createWebServer response on error', () => {
    it('Should return internal server error', async (t: TestContext) => {
      after(async () => {
        // Clean state
        await server.close();
      });

      // Arrange
      t.mock.method(global.console, 'error').mock.mockImplementation(() => {});

      const { server, address } = await net.createWebServer({
        fetchCallback: () => {
          throw new Error('Oops');
        }
      });

      // Act
      const response = await fetch(`http://localhost:${address.port}`);

      // Expect
      t.assert.equal(response.status, 500);
      t.assert.equal(response.statusText, 'Internal Server Error');
    });
  });

  describe('createWebServer request', async () => {
    const safeJsonParse = (data: string) => {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    };
    const { server, address } = await net.createWebServer({
      fetchCallback: async (ctx) => {
        const method = ctx.method; // GET, POST, ...
        const headers = Object.fromEntries(ctx.headers);
        const path = new URL(ctx.url).pathname;
        const query = Object.fromEntries(new URL(ctx.url).searchParams);
        const payload = safeJsonParse(Buffer.from(await ctx.arrayBuffer()).toString());

        return new Response(
          JSON.stringify({
            method,
            headers,
            path,
            query,
            payload
          })
        );
      }
    });

    after(async () => {
      // Clean state
      await server.close();
    });

    test('When request with method GET, then Should return request.', async (t: TestContext) => {
      // Act
      const response = await fetch(`http://localhost:${address.port}/api/test?message=hello`);
      const serverRequest = await response.json();

      // Expect
      t.assert.equal(response.status, 200);
      t.assert.equal(response.statusText, 'OK');
      t.assert.equal(response.headers.get('content-type'), 'text/plain;charset=UTF-8');
      t.assert.deepStrictEqual(serverRequest, {
        method: 'GET',
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate',
          'accept-language': '*',
          connection: 'keep-alive',
          host: `localhost:${address.port}`,
          'sec-fetch-mode': 'cors',
          'user-agent': 'node'
        },
        path: '/api/test',
        query: { message: 'hello' },
        payload: ''
      });
    });

    test('When request with method HEAD, then Should return request.', async (t: TestContext) => {
      // Act
      const response = await fetch(`http://localhost:${address.port}`, {
        method: 'HEAD'
      });

      // Expect
      t.assert.equal(response.status, 200);
      t.assert.equal(response.statusText, 'OK');
      t.assert.equal(response.headers.get('content-type'), 'text/plain;charset=UTF-8');
    });

    test('When request with method POST, then Should return request.', async (t: TestContext) => {
      // Arrange
      const payload = { message: 'hello world!' };

      // Act
      const response = await fetch(`http://localhost:${address.port}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const serverRequest = await response.json();

      // Expect
      t.assert.equal(response.status, 200);
      t.assert.equal(response.statusText, 'OK');
      t.assert.equal(response.headers.get('content-type'), 'text/plain;charset=UTF-8');
      t.assert.deepStrictEqual(serverRequest, {
        method: 'POST',
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate',
          'accept-language': '*',
          connection: 'keep-alive',
          'content-length': '26',
          'content-type': 'text/plain;charset=UTF-8',
          host: `localhost:${address.port}`,
          'sec-fetch-mode': 'cors',
          'user-agent': 'node'
        },
        path: '/',
        query: {},
        payload
      });
    });
  });
});
