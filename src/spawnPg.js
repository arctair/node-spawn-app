import childProcess from 'child_process';

import murder from './murder';
import portInUse from './portInUse';

const spawnPg = ({ user }) => portInUse(5432)
.then(portIsInUse => {
  if (portIsInUse) throw Error('Port 5432 already in use');
})
.then(() => new Promise((resolve, reject) => {
  const _process = childProcess.spawn(
    'docker',
    ['run', '--rm', '-e', `POSTGRES_USER=${user}`, '-p', '5432:5432', 'postgres:12-alpine'],
    { detached: true }
  );
  const stdout = [];
  _process.stdout.setEncoding('utf8');
  _process.stdout.on('data', data => stdout.push(data));
  const stderr = [];
  _process.stderr.setEncoding('utf8');
  _process.stderr.on('data', data => {
    stderr.push(data);
    if (data.indexOf('[1] LOG:  database system is ready to accept connections') > -1) {
      clearTimeout(timeout);
      resolve(_process);
    }
  });
  _process.on('exit', code => {
    if (code !== 0) reject(
      new Error(
        JSON.stringify({
          message: `Failed to launch docker run postgres: exit code ${code}`,
          stdout: stdout.join(),
          stderr: stderr.join(),
        })
      )
    );
  });
  const timeout = setTimeout(
    () => {
      murder(_process);
      reject(
        new Error(
          JSON.stringify({
            message: 'Failed to launch docker run postgres in 10 seconds',
            stdout: stdout.join(),
            stderr: stderr.join(),
          })
        )
      );
    },
    10000,
  );
}));

export default spawnPg;