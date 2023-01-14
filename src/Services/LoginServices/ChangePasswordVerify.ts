import api from "@/Services";

export default async (bodyObject: any) => {
  return await api.patch(`/settings/forget-password/verify`, bodyObject);
};
