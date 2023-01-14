import api from "@/Services";

export default async(searchString:any,pageNumber:number, pageSize:number) =>{
    const res= await api.get(`/user/search/?pageNumber=${pageNumber}&pageSize=${pageSize}&searchByName=${searchString}`);
    const {data} = res?.data
    if (!Array.isArray(data)) {
        return [];
    }

    return data
}


