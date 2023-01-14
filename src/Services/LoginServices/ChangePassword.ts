import api from "@/Services";

export default async (bodyObject: any) => {
  console.log("bodyObject", bodyObject);
  const response = await api.patch(
    `/settings/forget-password?type=${bodyObject.type}&email=${bodyObject.email}`
  );

  console.log("response---", response);

  return response;
};
