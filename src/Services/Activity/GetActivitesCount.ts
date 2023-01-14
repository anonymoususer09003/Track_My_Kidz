import api from "@/Services";

export default async (id: string) => {
  const response = await api.get(
    `/activity/count-pending-students-instructors?activity_id=${id}`
  );
  return response.data;
};
