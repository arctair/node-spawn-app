import net from 'net';

const portInUse = port => new Promise(resolve => {
  const portCheck = net.createServer()
  .once('error', error => {
    if (error.code == 'EADDRINUSE') {
      resolve(true);
    }
  })
  .once('listening', () => {
    portCheck.close();
    resolve(false);
  })
  .listen(port);
});

export default portInUse;