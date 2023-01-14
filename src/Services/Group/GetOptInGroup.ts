import api from "@/Services";

interface ChildrenActivities {
  email: string;
  status: string;
}

export default async (id: any) => {
  const response = await api.get(`/group/getOptInByGroupId?group_id=${id}`);
  return response.data;
};
