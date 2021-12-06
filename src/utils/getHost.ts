const getByEnv = () => {
  let host = '';

  const env = process.env.API_ENV;

  switch (env) {
    case 'stage': {
      const domain = document.domain;
      const port = document.location.port;
      host = `${domain}:${port}`;
      break;
    }
    case 'prod': {
      host = '';
      break;
    }
    default: {
      host = '192.168.0.101';
      break;
    }
  }

  return host;
};

export default getByEnv();
