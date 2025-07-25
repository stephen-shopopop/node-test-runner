import { net } from '#runner';
import { createHash } from 'node:crypto';
import test, { after, afterEach, describe, type TestContext } from 'node:test';

describe('createWebServer is reachable', async () => {
  after(async () => {
    // Clean state
    await smoker.destroy();
  });

  afterEach(() => {
    smoker.clearHistory();
  });

  // Arrange
  const smoker = await new net.Smoker(0).start();

  test('When request on smoker then should return records', async (t: TestContext) => {
    t.plan(3);

    // Arrange
    const method = 'GET';
    const path = '/';

    const fakeNow = 1700000000000; // Some timestamp
    t.mock.method(Date, 'now', () => fakeNow);

    const hash = createHash('sha1').update(`${method}:${path}`).digest('hex');

    const address = smoker.getAddressInfo();
    const url = new URL(path, `http://localhost:${address?.port}`);

    // Act
    const response = await fetch(url, { method });

    // Expect
    t.assert.equal(response.status, 200);
    t.assert.equal(smoker.getRecords().length, 1);
    t.assert.deepStrictEqual(smoker.getRecords().at(0), {
      id: hash,
      request: {
        method,
        headers: {
          accept: '*/*',
          'accept-encoding': 'gzip, deflate',
          'accept-language': '*',
          connection: 'keep-alive',
          host: `localhost:${address?.port}`,
          'sec-fetch-mode': 'cors',
          'user-agent': 'node'
        },
        path,
        query: {},
        body: '',
        datetime: fakeNow
      }
    });
  });

  test('When request on smoker then should return history', async (t: TestContext) => {
    t.plan(2);

    // Arrange
    const address = smoker.getAddressInfo();

    smoker.addMock({
      request: {
        method: 'GET',
        path: '/'
      }
    });

    // Act
    const response = await fetch(`http://localhost:${address?.port}`);

    // Expect
    t.assert.equal(response.status, 200);
    t.assert.strictEqual(smoker.getHistory().length, 1);
  });

  test('When multiple request on smoker then should return multiple history', async (t: TestContext) => {
    t.plan(1);

    // Arrange
    const address = smoker.getAddressInfo();

    smoker.addMock({
      request: {
        method: 'GET',
        path: '/'
      }
    });

    // Act
    await fetch(`http://localhost:${address?.port}`);
    await fetch(`http://localhost:${address?.port}`);

    // Expect
    t.assert.deepStrictEqual(smoker.getHistory().length, 2);
  });

  test('When request on smoker then should return history by mock_id', async (t: TestContext) => {
    t.plan(1);

    // Arrange
    const address = smoker.getAddressInfo();

    smoker.addMock({
      request: {
        method: 'GET',
        path: '/'
      }
    });

    const mock_id = smoker.addMock({
      request: {
        method: 'POST',
        path: '/test'
      }
    });

    // Act
    await fetch(`http://localhost:${address?.port}`);
    await fetch(`http://localhost:${address?.port}/test`, { method: 'POST' });

    // Expect
    t.assert.strictEqual(smoker.getHistory(mock_id).length, 1);
  });

  test('When mock partial response then should return mock_id response', async (t: TestContext) => {
    t.plan(3);

    // Arrange
    const address = smoker.getAddressInfo();

    smoker.addMock({
      request: {
        method: 'GET',
        path: '/'
      },
      response: {
        body: 'Oops'
      }
    });

    // Act
    const response = await fetch(`http://localhost:${address?.port}`);
    const body = await response.text();

    // Expect
    t.assert.equal(response.status, 200);
    t.assert.equal(response.headers.get('content-type'), 'text/plain;charset=UTF-8');
    t.assert.equal(body, 'Oops');
  });

  test('When mock response then should return mock_id response', async (t: TestContext) => {
    t.plan(4);

    // Arrange
    const payload = { error: 'Oops' };
    const address = smoker.getAddressInfo();

    smoker.addMock({
      request: {
        method: 'GET',
        path: '/api/testing'
      },
      response: {
        body: JSON.stringify(payload),
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'X-Timing': '24'
        }
      }
    });

    // Act
    const response = await fetch(`http://localhost:${address?.port}/api/testing`);
    const body = await response.json();

    // Expect
    t.assert.equal(response.status, 403);
    t.assert.equal(response.headers.get('content-type'), 'application/json');
    t.assert.equal(response.headers.get('x-timing'), '24');
    t.assert.deepStrictEqual(body, payload);
  });
});
