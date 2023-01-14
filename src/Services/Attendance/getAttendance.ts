import api from "@/Services";

export default async (id: any) => {
  return await api.get(`/attendance/findAttendance?activity_id=${id}`);
};
