import api from '@/Services'

export default async () => {
    const response = await api.post(`two-fa/reactivate`)
    return response.data
}
