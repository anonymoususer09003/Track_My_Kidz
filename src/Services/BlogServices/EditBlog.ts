import api from "@/Services";

export default async (blog: any, blogId:any) => {
    return await api.patch(`/blogs/${blogId}`, blog);
}
