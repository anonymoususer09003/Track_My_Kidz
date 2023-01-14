import api from '@/Services'

export default async () => {
    const response = await api.get(`/activity/findbykeyword`)
    return response.data
}
