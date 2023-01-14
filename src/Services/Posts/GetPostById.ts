import api from '@/Services'

export default async (id: any) => {
  const response = await api.get(`/post/${id}`)
  
  const data = response?.data
  return data
}
