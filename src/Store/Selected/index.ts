import {buildSlice} from '@thecodingmachine/redux-toolkit-wrapper'
import {BlogGetDto, PostGetDto} from '@/Models/PostDTOS/post.interface'
import ChangeSelectedState from "@/Store/Selected/ChangeSelectedState";
import {CurrentUserDTO, GetUserDTO} from "@/Models/UserDTOs";

export default buildSlice('selected', [ChangeSelectedState], {
    selectedPost: null,
    schedulerData: null,
}).reducer

export interface SelectedState {
    selectedPost: PostGetDto | null,
    selectedBlog: BlogGetDto | null,
    selectedBlogId: any | null,
    selectedProduct: any | null,
    schedulerData: any | null,
    selectedUserData: CurrentUserDTO | null
    selectedAmount: number | null
    selectedIsThumbnail: boolean | false
}
