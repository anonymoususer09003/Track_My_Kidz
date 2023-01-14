import api from '@/Services'

export default async (page: number, size: number, status: string) => {
    const response = await api.get(`/activity/findbystatus?status=${status}`)
    return response.data
}
