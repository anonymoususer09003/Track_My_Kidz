import api from '@/Services'
export default async (searchString:any,offset: any) => {

  const response = await api.get(`/post/featured?offset=${offset}&searchString=${searchString}`)
  const { data } = response?.data
  if (!Array.isArray(data)) {
    return [];
  }

  return data
}
