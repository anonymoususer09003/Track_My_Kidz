import api from "@/Services";

export default async (data: any) => {
  const response = await api.post(
    `/group/instructors-which-group-status-approved/pending/decline`,
    data
  );
  return response.data;
};
