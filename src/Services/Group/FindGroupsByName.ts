import api from "@/Services";

export default async (body, page_number, page_size) => {
  const response = await api.post(
    `/group/findGroupsByName?page_number=${page_number}&page_size=${page_size}`,
    body
  );
  return response.data;
};
