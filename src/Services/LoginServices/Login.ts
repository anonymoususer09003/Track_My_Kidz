import api from "@/Services";
import { getDeviceId } from "react-native-device-info";
export default async (loginObject: any, type: string) => {
  let data =
    type != "parent"
      ? { ...loginObject, deviceId: getDeviceId() }
      : { ...loginObject };
  return await api.post(`/auth/login/${type}`, data);
};
