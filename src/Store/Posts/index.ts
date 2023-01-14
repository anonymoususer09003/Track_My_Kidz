import {buildSlice} from '@thecodingmachine/redux-toolkit-wrapper'
import FetchFeaturedPosts from "@/Store/Posts/FetchFeaturedPosts";

const sliceInitialState = {
    posts: [],
}

export default buildSlice('posts', [FetchFeaturedPosts], sliceInitialState).reducer

export interface PostState {
    posts: any[]
    fetchPosts: {
        loading: boolean
        error: any
    }
}
