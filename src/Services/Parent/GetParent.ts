import api from "@/Services";
import {
  loadUserId,
  loadUserType,
  getStudentParentDetail,
  storeStudentParentDetail,
} from "@/Storage/MainAppStorage";
export default async (id: number| string) => {
  console.log("GetParent.ts line 9", id, typeof id);
  const getInfo = await getStudentParentDetail();
  if (getInfo) {
    return JSON.parse(getInfo);
  } else {
    if (!id ||(typeof id === 'number'&& isNaN(id))) return

    const response = await api.get(`/user/parent/${id}`);
    await storeStudentParentDetail(JSON.stringify(response.data));
    return response.data;
  }
};
