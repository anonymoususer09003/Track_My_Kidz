import api from '@/Services'


export default async (user: any): Promise<any> => {
    return await api.patch('/user', user);
};