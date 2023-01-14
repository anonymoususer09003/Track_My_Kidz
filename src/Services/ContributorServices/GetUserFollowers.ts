import api from "@/Services";

export default async(userId: string, searchString:any,pageNumber:number, pageSize:number) =>{
    const res= await api.get(`/user/isFollowed/${userId}?pageNumber=${pageNumber}&pageSize=${pageSize}&searchString=${searchString}`);
    const {data} = res?.data
    if (!Array.isArray(data)) {
        return [];
    }

    return data
}


