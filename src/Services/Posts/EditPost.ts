import api from '@/Services'
import { PostPatchDTO, PostPOSTDto } from '@/Models/PostDTOS/post.interface'

export default async (post: PostPatchDTO) => {
  const response = await api.put('post', post)
  return response.data
}
