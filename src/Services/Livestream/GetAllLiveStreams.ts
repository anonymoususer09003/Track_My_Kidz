import {
  LivestreamGetDTO,
  LivestreamPostDTO,
} from '@/Models/LivestreamDTOs/livestream.interface'
import api from '@/Services'

export default async () => {
  const response = await api.get('liveStream/all')
  return response.data
}
