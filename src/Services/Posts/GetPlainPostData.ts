import api from '@/Services'
import { PostPlainDTO } from '@/Models/PostDTOS/post.interface'

export default async (type: string) => {
  const response = await api.get<PostPlainDTO[]>(
    `/common/plain-data?type=${type}`,
  )
  return response.data
}
