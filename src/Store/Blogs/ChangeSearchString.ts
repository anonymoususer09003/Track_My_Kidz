import { createAction } from '@reduxjs/toolkit'
import { BlogsState } from '@/Store/Blogs'

interface PayloadInterface {
  payload: Partial<BlogsState>
}

export default {
  initialState: {},
  action: createAction<Partial<BlogsState>>('blogs/changeSearchString'),
  reducers(state: BlogsState, { payload }: PayloadInterface) {
    if (typeof payload.searchString !== 'undefined') {
      state.searchString = payload.searchString
    }
    if (typeof payload.isLoadingBlogs !== 'undefined') {
      state.isLoadingBlogs = payload.isLoadingBlogs
    }
    if (typeof payload.userId !== 'undefined') {
      state.userId = payload.userId
    }
    if (typeof payload.postId !== 'undefined') {
      state.postId = payload.postId
    }
    if (typeof payload.commentId !== 'undefined') {
      state.commentId = payload.commentId
    }
    if (typeof payload.menuId !== 'undefined') {
      state.menuId = payload.menuId
    }
    if (typeof payload.screenName !== 'undefined') {
      state.screenName = payload.screenName
    }
    if (typeof payload.reloadContributors !== 'undefined') {
      state.reloadContributors = payload.reloadContributors
    }
  },
}
