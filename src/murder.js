const murder = _process => {
  const interval = setInterval(
    () => {
      if (_process.exitCode === null) _process.kill('SIGINT');
      else clearInterval(interval);
    },
    25,
  );
}

export default murder;