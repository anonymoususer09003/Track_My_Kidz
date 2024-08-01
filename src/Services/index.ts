import axios from 'axios';
import handleError from '@/Services/utils/handleError';
import { Config } from '@/Config';
import { loadToken } from '@/Storage/MainAppStorage';
import header from '@/Store/header';

const instance = axios.create({
  baseURL: Config.API_URL,
  headers: {
    Accept: '*/*',

    'Content-Type': 'application/json',
  },
  // timeout: 60000,
});

instance.interceptors.request.use(async (request) => {
  const token = await loadToken();
  if (token) {
    switch (request.url) {
      case '/contact-us/create':
        request.headers.Authorization = token;
        break;

      case '/user/student/create':
      case '/user/student/update':
      case '/user/instructor/create':
      case '/user/instructor/update':
        request.headers.Authorization = token;
        request.headers['Content-Type'] = 'multipart/form-data';
        request.headers.Accept = '*/*';
        break;

      default:
        request.headers.Authorization = token;
    }
  }

  console.log('request', request.headers);
  return request;
});

instance.interceptors.response.use(
  (response) => response,
  ({ message, response: { data, status } }) => {
    console.log('response', message, data);

    return handleError({ message, data, status });
  }
);

export default instance;
