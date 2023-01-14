import api from '@/Services'

export default async (bodyObject: any) => {
  return await api.post('/login/forgot', bodyObject)
}
