import { GetUserDTO } from '@/Models/UserDTOs'

export interface LivestreamPostDTO {
  allowComments: boolean
  description?: string
  inviteFollowers: boolean
  inviteFollowing: boolean
  length: number
  title: string
  scheduledDate?: Date
}
export interface LivestreamGetDTO {
  allowComments: boolean
  creator: GetUserDTO
  description: string
  hostLiveStreamLink: string
  id: string
  inviteFollowers: boolean
  inviteFollowing: boolean
  length: number
  meetingPassword: string
  participantsLink: string
  scheduledDate: Date
  status: string
  title: string
  zoomAccessToken: string
  zoomMeetingId: number
  zoomToken: string
  zoomUserId: string
  currency:string
}
