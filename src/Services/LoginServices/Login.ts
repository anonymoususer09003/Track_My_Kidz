import api from '@/Services'

export default async (loginObject: any, type: string) => {
    return await api.post(`/auth/login/${type}`, loginObject);
}
