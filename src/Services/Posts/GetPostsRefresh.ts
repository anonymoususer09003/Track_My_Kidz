import api from '@/Services'

export default async (date:any) => {
  const response = await api.get(`/post-refresh/date/${date}`)
  const data = response.data;
  return data
}
