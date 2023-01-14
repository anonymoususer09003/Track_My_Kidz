import api from "@/Services";

export default async  (enable: any) => {
    return await api.post('/user/private/all-followers', enable);
}
