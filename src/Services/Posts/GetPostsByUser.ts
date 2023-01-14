import api from '@/Services'

export default async (searchString:any,pageNumber:number, pageSize:number,  userId:any) => {
  const response = await api.get(`/user/${userId}/post?pageNumber=${pageNumber}&pageSize=${pageSize}&searchString=${searchString}`)
  const {data} = response?.data
  if (!Array.isArray(data)) {
      return [];
  }

  return data
}