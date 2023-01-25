import api from "@/Services";

export default async (
  id: number,
  page: number,
  pageSize: number,
  config: any
) => {
  const response = await api.get(
    `/group/find-groups-by-userId?user_id=${id}&page_number=${page}&page_size=${pageSize}`,
    config
  );
  return response.data;
};
