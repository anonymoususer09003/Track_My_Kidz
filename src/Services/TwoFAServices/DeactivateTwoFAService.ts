import api from '@/Services'

export default async () => {
    const response = await api.post(`two-fa/deactivate`)
    return response.data
}
