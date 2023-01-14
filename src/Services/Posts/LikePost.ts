import api from '@/Services'

export default async (  id:any) => {
  const response = await api.post(`/post/${id}/like`)
  return response
}
