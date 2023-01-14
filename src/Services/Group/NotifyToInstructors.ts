import api from '@/Services'

export default async (groupId: number, data: any) => {
    const response = await api.post(`/group/notify-to-instructors/${groupId}`, JSON.stringify(data))
    return response.data
}
