import api from '@/Services'

export default async (data: {email: string, password: string, type: string}) => {
    const response = await api.post(`/user/parent/validatePassword`, data)
    return response.data
}
