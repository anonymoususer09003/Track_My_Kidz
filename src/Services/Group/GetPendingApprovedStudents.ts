import api from "@/Services";

export default async (data: any) => {
  const response = await api.post(
    `/group/students-which-group-status-approved/pending/decline`,
    data
  );
  return response.data;
};
