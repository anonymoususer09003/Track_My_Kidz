import api from '@/Services'

export default async (name: string) => {
    const response = await api.get(`/activity/findbyActivityName?activityName=${name}`)
    return response.data
}
