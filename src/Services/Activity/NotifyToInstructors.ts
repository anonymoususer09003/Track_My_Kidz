import api from '@/Services'

export default async (activityId: number, data: any) => {
    const response = await api.post(`/activity/notify-to-instructors/${activityId}`, JSON.stringify(data))
    return response.data
}
