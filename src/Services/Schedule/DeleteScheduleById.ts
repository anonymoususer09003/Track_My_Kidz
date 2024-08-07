import api from '@/Services';

export default async (id: number) => {
  try {
    const response = await api.delete(`/schedule/${id}`);
    return response.data;
  } catch (err) {
    throw err;
  }
};
