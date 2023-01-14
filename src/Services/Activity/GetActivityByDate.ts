import api from '@/Services'

export default async () => {
    const response = await api.get(`/activity/findbydates`)
    return response.data
}
