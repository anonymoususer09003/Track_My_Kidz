import api from "@/Services";

export default async (password: any) => {
  return await api.patch(`/settings/change-password?oldPassword=${password}`);
};
