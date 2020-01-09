import childProcess from 'child_process';
import portInUse from './portInUse';

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
    async () => {
      if (await portInUse(port)) {
        clearInterval(interval);
        clearTimeout(timeout);
        resolve(_process);
      }
    },
    10,
  );
});

export default spawnApp;