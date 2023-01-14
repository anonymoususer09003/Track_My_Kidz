import api from '@/Services'

export default async (postId: any) => {
    return await api.delete( `/post/${postId}`)
}
