import api from '@/Services';
import {
  getInstructorDetail,
  storeInstructorDetail,
} from '@/Storage/MainAppStorage';

export default async (id: number | string) => {
  let instructorDetail = await getInstructorDetail();
  if (false && instructorDetail) {
    return JSON.parse(instructorDetail);
  } else {
    if (!id ||(typeof id === 'number'&& isNaN(id))) return

    const response = await api.get(`/user/instructor/${id}`);
    await storeInstructorDetail(JSON.stringify(response.data));
    return response.data;
  }
};
