import api from "@/Services";

export default async(searchString:any,pageNumber:number, pageSize:number,  postId:any) =>{
    const res= await api.get(`post/${postId}/comments?pageNumber=${pageNumber}&pageSize=${pageSize}&searchString=${searchString}`);
    const {data} = res?.data

    if (!Array.isArray(data)) {
        return [];
    }

    return data
}


