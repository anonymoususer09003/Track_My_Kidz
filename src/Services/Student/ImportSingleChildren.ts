import api from "@/Services";

export default async (referenceCode: any) => {
  console.log("reference code", referenceCode);
  const response = await api.post(
    `/user/student/importChild/${referenceCode}`,
    {}
  );
  return response.data;
};
