import api from "@/Services";

export default async (body: any, config: any) => {
  const response = await api.post(
    `/user/instructor/find-instructors-in-school`,
    body,
    config ? config : {}
  );
  return response.data;
};
