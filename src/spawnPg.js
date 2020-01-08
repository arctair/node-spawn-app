import childProcess from 'child_process';

const pgIsReady = ({ user }) => new Promise(
  resolve => childProcess
    .spawn('pg_isready', ['-h', 'localhost', '-U', user])
    .on('close', exitStatus => resolve(exitStatus === 0))
);

const spawnPg = ({ user }) => new Promise((resolve, reject) => {
  const _process = childProcess.spawn(
    'docker',
    ['run', '--rm', '-e', `POSTGRES_USER=${user}`, '-p', '5432:5432', 'postgres:12-alpine']
  );
  const timeout = setTimeout(
    () => {
      clearInterval(interval);
      reject(new Error('failed to start the db in 10 seconds', _process));
    },
    10000,
  );
  const interval = setInterval(
    async () => {
      if (await pgIsReady({ user })) {
        clearInterval(interval);
        clearTimeout(timeout);
        resolve(_process);
      }
    },
    10,
  );
});

export default spawnPg;