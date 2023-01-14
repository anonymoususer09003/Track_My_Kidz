import api from '@/Services'

export default async (code: string) => {
    const response = await api.post(`two-fa/confirm`,{code:code})
    return response.data
}
