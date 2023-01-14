import api from '@/Services'

export default async (activiationCode) => {
    const response = await api.get(`/auth/student/${activiationCode}`)
    return response.data
}
