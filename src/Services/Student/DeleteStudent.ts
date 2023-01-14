import api from "@/Services";

export default async (id: number, parentId: number) => {
  console.log("id", id);
  console.log("parentid", parentId);
  const response = await api.delete(
    `/user/student/delete/${id}/${parentId}?approve=true`
  );
  console.log("logs", response);
  return response.data;
};
