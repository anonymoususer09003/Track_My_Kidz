import api from "@/Services";

export default async (body: any) => {
  const response = await api.delete(
    `/activity/remove-student-instructor-from-group
    `,
    { data: body }
  );
  return response.data;
};
