import api from "@/Services";

export default async (id: number, page: number, pageSize: number) => {
  console.log("id++++++++++++++++++++++==", id);
  const response = await api.get(
    `/activity/find-activities-by-instructorId?instructor_id=${id}&page_number=${page}&page_size=${pageSize}`
  );
  return response.data;
};
