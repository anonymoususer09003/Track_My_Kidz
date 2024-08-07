import api from '@/Services';

export default async (countryId: any): Promise<any> => {
  return await api.get(`/public/places/country/${countryId}/state`);
};
