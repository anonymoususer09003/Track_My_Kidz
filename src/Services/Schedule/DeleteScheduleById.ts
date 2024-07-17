import api from '@/Services'

export default async (id: number) => {
    try{
    console.log(`/schedule/${id}`)
    const response = await api.delete(`/schedule/${id}`)
    return response.data
    }
    catch(err)
    {
        throw err
    }
}
