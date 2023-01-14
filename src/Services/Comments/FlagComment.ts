import api from "@/Services";

export default async (comment: any) => {     
    const res= await api.put(`/comment/flag`,comment);
    return res
}
