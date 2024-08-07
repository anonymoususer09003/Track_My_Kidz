import api from '@/Services';

export default async (bodyObject: any) => {
  const response = await api.patch(
    `/settings/forget-password?type=${bodyObject.type}&email=${bodyObject.email}`
  );

  return response;
};
