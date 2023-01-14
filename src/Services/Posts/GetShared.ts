import api from '@/Services'

export default async (searchString:any,pageNumber:number, pageSize:number) => {
  const response = await api.get(`/post/shared?pageNumber=${pageNumber}&pageSize=${pageSize}&searchString=${searchString}`)
  const {data} = response?.data
  if (!Array.isArray(data)) {
      return [];
  }

  return data
}
