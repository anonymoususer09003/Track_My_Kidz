import api from "@/Services";

export default async (body: any) => {
  const response = await api.post(
    `/user/instructor/find-instructors-in-school
    `,
    body
  );
  return response.data;
};
