import { type Server, createServer } from 'node:http';
import { net, after, before, describe, expect, it } from '#runner';

describe('Net', () => {
  describe('isPortReachable', () => {
    it('Should return server not reachable', async () => {
      // Act
      const value = await net.isPortReachable(9999);

      // Expect
      expect(value).toBeFalsy();
    });

    it('Should return server reachable', async () => {
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
      expect(value).toBeTruthy();
    });
  });
});
