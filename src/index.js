import childProcess from 'child_process';
import net from 'net';

const spawnApp = ({ env = process.env, port, path }) => new Promise((resolve, reject) => {
  const _process = childProcess.spawn(
    'babel-node',
    [path],
    {
      stdio: 'inherit',
      env,
    },
  );
  const timeout = setTimeout(
    () => {
      clearInterval(interval);
      reject(new Error('failed to start the app in 1 second', _process));
    },
    1000,
  );
  const interval = setInterval(
    () => {
      const portCheck = net.createServer()
      .once('error', error => {
        if (error.code == 'EADDRINUSE') {
          clearInterval(interval);
          clearTimeout(timeout);
          resolve(_process);
        }
      })
      .once('listening', () => portCheck.close())
      .listen(port);
    },
    10,
  );
});

export default spawnApp;