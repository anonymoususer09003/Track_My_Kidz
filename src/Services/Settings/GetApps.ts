import api from '@/Services'

export default async () => {  
  const response = await api.get(`apps`)
 
  return response.data
}
