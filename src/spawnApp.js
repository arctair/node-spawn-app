import childProcess from 'child_process';

import portInUse from './portInUse';

const spawnApp = ({ env = process.env, port, path }) => portInUse(port)
.then(portIsInUse => {
  if (portIsInUse) throw Error(`Port ${port} already in use`);
})
.then(() => new Promise((resolve, reject) => {
  const _process = childProcess.spawn(
    'babel-node',
    [path],
    {
      detached: true,
      env,
    },
  );
  const stdout = [];
  _process.stdout.setEncoding('utf8');
  _process.stdout.on('data', data => stdout.push(data));
  const stderr = [];
  _process.stderr.setEncoding('utf8');
  _process.stderr.on('data', data => stderr.push(data));
  _process.on('exit', code => {
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
      const error = new Error(JSON.stringify({
        message: 'Failed to launch babel-node in 1 second',
        stdout: stdout.join(),
        stderr: stderr.join(),
      }));
      _process.kill();
      reject(error);
    },
    1000,
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