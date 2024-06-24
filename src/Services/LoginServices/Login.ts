import api from '@/Services';
import { getUniqueId } from 'react-native-device-info';

export default async (loginObject: any, type: string) => {
  try {
    const deviceId = await getUniqueId();
    const data = type != 'parent' ? { ...loginObject, deviceId } : { ...loginObject, deviceId: '' };
    console.log('data', data);
    console.log('url', `/auth/login/${type}`);
    let res = await api.post(`/auth/login/${type}`, data);
    return res;
  } catch (err) {
    console.log('err login', err);
  }
};
