import api from "@/Services";

export default async (countryId: any): Promise<any> => {
  console.log("countryid00000000000000000000", countryId);
  return await api.get(`/public/places/country/${countryId}/state`);
};
