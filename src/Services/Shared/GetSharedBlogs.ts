import api from '@/Services'

export default async (searchString: any, pageNumber: number, pageSize: number) => {
    let response
    if (searchString !== undefined) {

        response = await api.get(`post/shared?pageNumber=${pageNumber}&pageSize=${pageSize}&searchString=${searchString}&postType=BLOG`)
    }
    
    const data = response?.data?.data
    if (data === undefined) {
        return [];
    }
    return data
}
