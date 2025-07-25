import net from 'node:net';

/**
 * Check if a local or remote port is reachable
 * This function attempts to connect to a specified port on a given host
 * within a specified timeout period. If the connection is successful, it resolves to true,
 * indicating that the port is reachable. If the connection fails or times out, it resolves to false.
 *
 * @param port The port to check
 * @param host The host to check. Default `localhost`
 * @param timeout The time to wait in milliseconds before giving up. Default `1000`
 * @returns A promise that resolves to true if the port is reachable, false otherwise.
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
