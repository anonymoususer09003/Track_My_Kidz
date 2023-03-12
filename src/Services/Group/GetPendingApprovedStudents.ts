import api from "@/Services";

export default async (data: any) => {
  const response = await api.post(
    `/group/students-which-group-status-approved/pending/decline?page_number=${data.page}&page_size=${data.page_size}`,
    data
  );
  return response.data;
};
