import api from "@/Services";
import {
  loadUserId,
  loadUserType,
  getStudentParentDetail,
  storeStudentParentDetail,
} from "@/Storage/MainAppStorage";
export default async (id: number) => {
  const getInfo = await getStudentParentDetail();
  if (getInfo) {
    return JSON.parse(getInfo);
  } else {
    const response = await api.get(`/user/student/${id}`);
    await storeStudentParentDetail(JSON.stringify(response.data));
    return response.data;
  }
};
