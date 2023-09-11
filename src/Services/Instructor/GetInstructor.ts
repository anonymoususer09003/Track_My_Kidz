import api from "@/Services";
import {
  getInstructorDetail,
  storeInstructorDetail
} from "@/Storage/MainAppStorage";
export default async (id: number, config: any) => {
  let instructorDetail = await getInstructorDetail();
  if (instructorDetail) {
    return JSON.parse(instructorDetail);
  } else {
    const response = await api.get(`/user/instructor/${id}`);
    storeInstructorDetail(JSON.stringify(response.data));
    return response.data;
  }
};
