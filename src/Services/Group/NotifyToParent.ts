import api from '@/Services'

export default async (groupId: number, data: any) => {
    const response = await api.post(`/group/notify-to-student-parents/${groupId}`, JSON.stringify(data))
    return response.data
}
