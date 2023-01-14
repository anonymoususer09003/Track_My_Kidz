import api from '@/Services'
import { PostPOSTDto } from '@/Models/PostDTOS/post.interface'

export default async (post: PostPOSTDto) => {
  const response = await api.post('post', post)
  return response.data
}
