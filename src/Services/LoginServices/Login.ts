import api from '@/Services';
import { getUniqueId } from 'react-native-device-info';

export default async (loginObject: any, type: string) => {
  const deviceId = await getUniqueId();
  const data =
    type != 'parent'
      ? { ...loginObject, deviceId }
      : { ...loginObject, deviceId: '' };

  return await api.post(`/auth/login/${type}`, data);
};
