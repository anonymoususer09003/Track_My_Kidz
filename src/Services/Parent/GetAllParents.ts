import api from '@/Services'

export default async () => {
    const response = await api.get(`/user/parent/findall`)
    return response.data
}
