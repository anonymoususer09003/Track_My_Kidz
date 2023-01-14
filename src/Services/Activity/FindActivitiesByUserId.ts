import api from "@/Services";

export default async (id: number, page: number, pageSize: number) => {
  console.log("here");
  console.log(
    `/activity/find-activities-by-userId?user_id=${id}&page_number=${page}&page_size=${pageSize}`
  );
  const response = await api.get(
    `/activity/find-activities-by-userId?user_id=${id}&page_number=${page}&page_size=${pageSize}`
  );
  return response.data;
};
