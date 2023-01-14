import api from "@/Services";

export default async (searchString: string, page: number, limit: number, searchByName: string) => {

    const res = await api.get('/user/simple-search?pageNumber=${page}&pageSize=${limit}&searchString=${searchString}&searchByName=${searchByName}');

    const {data} = res?.data
    if (!Array.isArray(data)) {
        return [];
    }

    return data
}
