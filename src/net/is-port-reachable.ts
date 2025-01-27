import net from 'node:net';

/**
 * Check if a local or remote port is reachable
 *
 * @param port The port to check
 * @param host The host to check. Default `localhost`
 * @param timeout The time to wait in milliseconds before giving up.Default `1000`
 */
export async function isPortReachable(
  port: number,
  host = 'localhost',
  timeout = 1000
): Promise<boolean> {
  return await new Promise((resolve) => {
    const socket = new net.Socket();

    const onError = (): void => {
      socket.destroy();

      resolve(false);
    };

    socket.setTimeout(timeout);
    socket.once('error', onError);
    socket.once('timeout', onError);

    socket.connect(port, host, () => {
      socket.end();

      resolve(true);
    });
  });
}
