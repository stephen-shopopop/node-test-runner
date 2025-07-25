import { type Server, createServer } from 'node:http';
import { net } from '#runner';
import { after, before, describe, it, type TestContext } from 'node:test';

describe('isPortReachable', () => {
  it('Should return server not reachable', async (t: TestContext) => {
    t.plan(1);

    // Act
    const value = await net.isPortReachable(9999);

    // Expect
    t.assert.equal(value, false);
  });

  it('Should return server reachable', async (t: TestContext) => {
    t.plan(1);

    let server: Server;

    before(() => {
      // Place the server under test within the same process
      server = createServer((_req, res) => {
        res.end('Hello World!\n');
      });

      server.listen(8080, '127.0.0.1');
    });

    after(async () => {
      // Clean state
      await server.close();
    });

    // Act
    const value = await net.isPortReachable(8080);

    // Expect
    t.assert.equal(value, true);
  });
});
