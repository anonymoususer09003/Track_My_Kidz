import api from "@/Services";

export default async (scheduleId:any,body:any) => {


  const response = await api.put(`/schedule/${scheduleId}`,body);
  return response.data;
};
