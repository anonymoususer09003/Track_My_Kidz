import api from '@/Services'

export default async (searchString:any,offset:any, id:any) => {
  const response = await api.get(`/post/module/${id}?offset=${offset}&searchString=${searchString}`)
  const {data} = response?.data
  if (!Array.isArray(data)) {
      return [];
  }

  return data
}
