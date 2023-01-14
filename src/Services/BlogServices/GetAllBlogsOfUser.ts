import api from "@/Services";

export default async(searchString:any,pageNumber:number, pageSize:number,  userId:any) =>{
    const res= await api.get(`/blogs/users/${userId}?pageNumber=${pageNumber}&pageSize=${pageSize}&searchString=${searchString}`);
    const {data} = res?.data

    
    if (!Array.isArray(data)) {
        return [];
    }

    return data
}


