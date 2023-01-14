import api from '@/Services'

export default async (activityId: number, data: any) => {
    const response = await api.post(`/activity/notify-to-parents/${activityId}`, JSON.stringify(data))
    return response.data
}
