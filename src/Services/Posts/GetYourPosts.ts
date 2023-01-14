import api from '@/Services'
import { PostDataTable} from '@/Models/PostDTOS/post.interface';

export default async () => {
  const response = await api.get<PostDataTable>('/post/your-post')
  return response.data
}
