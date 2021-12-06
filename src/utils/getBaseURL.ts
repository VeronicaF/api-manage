import host from './getHost';

const env = process.env.API_ENV;

export const URL = `${env === 'prod' ? 'https' : 'http'}://${host}`;

const api = `${URL}/api/v1/`;
export default api;
// 这个端口是在.env中定的
export const MOCK_API_URL = 'http://localhost:8080/api/v1/';
export const WS_API_URL = `${env === 'prod' ? 'wss' : 'ws'}://${host}/api/v1/`;
export const NOTICE_API_URL = `${env === 'prod' ? 'wss' : 'ws'}://${host}/message`;
