import api from "@/Services";

export default async (id: number, eta: any) => {
  const response = await api.get(
    `/activity/journeyTracker?activity_id=${id}24&ETA=${eta}`
  );
  return response.data;
};
