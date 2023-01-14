import api from '@/Services'

export default async (id: number, status: boolean) => {
    const response = await api.post(`/activity/${id}/status/${status}`)
    return response.data
}
