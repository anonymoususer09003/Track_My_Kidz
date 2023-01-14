import api from '@/Services'

export default async (bodyObject: any) => {
  return await api.post('/public/mobile-user/login/forgot', bodyObject)
}
