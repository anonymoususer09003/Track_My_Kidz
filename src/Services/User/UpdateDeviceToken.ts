import api from '@/Services'

export default async (token: string) => {
    const response = await api.post(`user/device-token`,{token:token})
    return response.data
}
