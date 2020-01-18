import childProcess from 'child_process';

import portInUse from './portInUse';

const spawnApp = ({ timeoutMs = 1000, env: { PORT: port = 8080, ...env } = process.env, path }) => portInUse(port)
.then(portIsInUse => {
  if (portIsInUse) throw Error(`Port ${port} already in use`);
})
.then(() => new Promise((resolve, reject) => {
  let hasExited = false;
  const _process = childProcess.spawn(
    'babel-node',
    [path],
    {
      detached: true,
      env: { PORT: port, ...env },
    },
  );
  const stdout = [];
  _process.stdout.setEncoding('utf8');
  _process.stdout.on('data', data => stdout.push(data));
  const stderr = [];
  _process.stderr.setEncoding('utf8');
  _process.stderr.on('data', data => stderr.push(data));
  _process.on('exit', code => {
    hasExited = true;
    if (code !== 0) {
      const error = new Error(JSON.stringify({
        message: `Failed to launch babel-node: exit code ${code}`,
        stdout: stdout.join(),
        stderr: stderr.join(),
      }));
      reject(error);
    };
  });
  const timeout = setTimeout(
    () => {
      clearInterval(interval);
      _process.kill('SIGINT');
      const killInterval = setInterval(
        () => {
          if (hasExited) clearInterval(killInterval);
          else _process.kill('SIGINT');
        },
        1000,
      );
      reject(
        new Error(
          JSON.stringify({
            message: `Failed to launch babel-node in ${timeoutMs} ms`,
            stdout: stdout.join(),
            stderr: stderr.join(),
          })
        )
      );
    },
    timeoutMs,
  );
  const interval = setInterval(
    async () => {
      if (await portInUse(port)) {
        clearInterval(interval);
        clearTimeout(timeout);
        resolve(_process);
      }
    },
    10,
  );
}));

export default spawnApp;