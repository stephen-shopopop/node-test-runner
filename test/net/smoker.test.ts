import { net, expect } from '#runner';
import test, { after, afterEach, describe } from 'node:test';

describe('Net smoker #net #smoker', () => {
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

    test('When request on smoker then should return records', async () => {
      // Arrange
      const address = smoker.getAddressInfo();

      // Act
      const response = await fetch(`http://localhost:${address?.port}`);

      // Expect
      expect(response.status).toBe(200);
      expect(smoker.getRecords()).toHaveLength(1);
      expect(smoker.getRecords()).toEqual([
        {
          id: expect.any(String),
          request: {
            method: 'GET',
            headers: expect.any(Object),
            path: '/',
            query: {},
            body: '',
            datetime: expect.any(Number)
          }
        }
      ]);
    });

    test('When request on smoker then should return history', async () => {
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
      expect(response.status).toBe(200);
      expect(smoker.getHistory()).toHaveLength(1);
      expect(smoker.getHistory()).toEqual([
        {
          mock_id: expect.any(String),
          request: {
            method: 'GET',
            headers: expect.any(Object),
            path: '/',
            query: {},
            body: '',
            datetime: expect.any(Number)
          }
        }
      ]);
    });

    test('When multiple request on smoker then should return multiple history', async () => {
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
      expect(smoker.getHistory()).toHaveLength(2);
    });

    test('When request on smoker then should return history by mock_id', async () => {
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
      expect(smoker.getHistory(mock_id)).toHaveLength(1);
    });

    test('When mock partial response then should return mock_id response', async () => {
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
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('text/plain;charset=UTF-8');
      expect(body).toBe('Oops');
    });

    test('When mock partial response then should return mock_id response', async () => {
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
      expect(response.status).toBe(403);
      expect(response.headers.get('content-type')).toBe('application/json');
      expect(response.headers.get('x-timing')).toBe('24');
      expect(body).toStrictEqual(payload);
    });
  });
});
