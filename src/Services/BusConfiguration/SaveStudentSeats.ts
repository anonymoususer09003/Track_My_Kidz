import api from "@/Services";

export default async (id: any, bus: any) => {
  return await api.post(`/user/bus/saveStudentSeats?bus_id=${id}`, bus);
};
