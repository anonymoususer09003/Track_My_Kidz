import { RegisterDTO } from "@/Models/UserDTOs";
import api from "@/Services";

export default async (body: any) => {
  let res = await api.post(
    `https://live-api.trackmykidz.com/aws-tracker/getDevicePositions`,
    body
  );
  return res.data;
};
