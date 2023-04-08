import api from "@/Services";
import { getDeviceId, getUniqueId } from "react-native-device-info";
export default async (loginObject: any, type: string) => {
  let data =
    type != "parent"
      ? { ...loginObject, deviceId: getUniqueId() }
      : { ...loginObject, deviceId: "" };

  const res = await api.post(`/auth/login/${type}`, data);

  return res;
};
