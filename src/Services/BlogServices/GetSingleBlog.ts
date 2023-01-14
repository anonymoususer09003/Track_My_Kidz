import api from "@/Services";

export default async(blogId:any) =>{
    const res= await api.get(`/blogs/${blogId}`);
    return res?.data
}


