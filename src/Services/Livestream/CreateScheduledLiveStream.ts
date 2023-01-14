import {
  LivestreamGetDTO,
  LivestreamPostDTO,
} from '@/Models/LivestreamDTOs/livestream.interface'
import api from '@/Services'

export default async (body: LivestreamPostDTO) => {
  const response = await api.post<LivestreamGetDTO>(
    'liveStream/schedule',
    body,
  )
  return response.data
}
