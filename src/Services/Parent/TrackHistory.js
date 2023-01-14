import api from "@/Services";

export default async (trackHistory, studentId, date, latitude, longititude) => {
  console.log(
    "log---------",
    `/user/parent/trackHistory?trackHistory=${trackHistory}&studentId=${studentId}&date=${date}&latitude=${latitude}&longititude=${longititude}`
  );
  const response = await api.post(
    `/user/parent/trackHistory?trackHistory=${trackHistory}&studentId=${studentId}&date=${date}&latitude=${latitude}&longititude=${longititude}`
  );
  return response.data;
};
