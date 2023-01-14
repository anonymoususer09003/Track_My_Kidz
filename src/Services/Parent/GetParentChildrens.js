import api from "@/Services";

export default async (data) => {
  console.log(`/user/parent/getChildren?referenceCode=${data}`);
  const response = await api.get(
    `/user/parent/getChildren?referenceCode=${data}`
  );
  return response.data;
};
