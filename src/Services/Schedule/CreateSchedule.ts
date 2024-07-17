import api from "@/Services";

export default async (isPractice: Boolean,body:any) => {
console.log(`9999999999999999999999999/schedule?isPractice=${isPractice}`,body)

  const response = await api.post(`/schedule?isPractice=${isPractice}`,body);
  return response.data;
};
