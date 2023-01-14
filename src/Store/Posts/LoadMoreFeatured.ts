import {buildAsyncActions, buildAsyncReducers, buildAsyncState,} from '@thecodingmachine/redux-toolkit-wrapper'
import {GetPosts} from "@/Services/Posts";

export default {
    initialState: buildAsyncState('loadMoreFeatured'),
    action: buildAsyncActions('posts/fetchFeaturedPosts', async (args, {dispatch}) => {
        return await GetPosts(0)
    }),
    reducers: buildAsyncReducers({
        itemKey: 'posts',
        errorKey: 'fetchPosts.error', // Optionally, if you scoped variables, you can use a key with dot notation
        loadingKey: 'fetchPosts.loading',
    }),
}
