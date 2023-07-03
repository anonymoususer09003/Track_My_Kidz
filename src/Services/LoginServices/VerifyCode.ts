import api from "@/Services";

export default async (type: any, data: any) => {
  return await api.post(
    `https://live-api.trackmykidz.com/auth/validate/${type}`,
    data
  );
};
