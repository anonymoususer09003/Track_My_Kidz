import api from '@/Services'

export default async (searchString: any, pageNumber: number, pageSize: number) => {
    let response
    if (searchString !== undefined) {

        response = await api.get(`products/shared?pageNumber=${pageNumber}&pageSize=${pageSize}&searchString=${searchString}`)
    }
    const data = response?.data?.data
    if (data === undefined) {
        return [];
    }
    return data
}
