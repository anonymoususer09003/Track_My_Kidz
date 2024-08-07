import api from '@/Services';

interface ChildrenActivities {
  email: string;
  status: string;
  page: number;
  pageSize: number;
}

export default async (email: string, status: string, page: number, pageSize: number) => {
  const response = await api.get(
    `/group/getChildrenGroups?page_number=${page}&page_size=${pageSize}&email=${email}&status=${status}`
  );
  return response.data;
};
