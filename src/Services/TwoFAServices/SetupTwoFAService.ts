import api from '@/Services'

export default async (code?: string) => {
    const response = await api.post(`two-fa/setup?token=${code}`)
    return response.data
}
