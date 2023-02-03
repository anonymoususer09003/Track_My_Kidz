import api from "@/Services";
import {
  loadUserId,
  loadUserType,
  getStudentParentDetail,
  storeStudentParentDetail,
} from "@/Storage/MainAppStorage";
export default async (id: number) => {
  console.log("logss0s909s090s90");
  const getInfo = await getStudentParentDetail();
  if (getInfo) {
    return JSON.parse(getInfo);
  } else {
    const response = await api.get(`/user/parent/${id}`);
    await storeStudentParentDetail(JSON.stringify(response.data));
    return response.data;
  }
};
