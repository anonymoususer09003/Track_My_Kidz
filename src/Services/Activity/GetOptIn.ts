import api from "@/Services";

interface ChildrenActivities {
  email: string;
  status: string;
}

export default async (id: any) => {
  const response = await api.get(
    `/activity/getOptInByActivityId?activity_id=${id}`
  );
  return response.data;
};
