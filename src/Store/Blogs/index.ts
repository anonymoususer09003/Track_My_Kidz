import { buildSlice } from '@thecodingmachine/redux-toolkit-wrapper'
import ChangeSearchString from '@/Store/Blogs/ChangeSearchString'

export default buildSlice('blogs', [ChangeSearchString], {
  searchString: '',
  isLoadingBlogs: false,
  userId: '',
  postId: '',
  commentId: '',
  menuId: '',
  screenName: '',
  reloadContributors: ''
}).reducer

export interface BlogsState {
  searchString: string | null,
  isLoadingBlogs: boolean | null,
  userId: any | null,
  postId: any | null,
  commentId: any | null,
  menuId: any | null,
  screenName: string | null,
  reloadContributors: boolean | null
}
