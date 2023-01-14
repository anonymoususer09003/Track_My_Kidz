import api from '@/Services'

export default async (activiationCode) => {
    const response = await api.get(`/user/student/activiationcode/${activiationCode}`)
    return response.data
}
