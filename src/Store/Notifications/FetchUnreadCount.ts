import {
    buildAsyncState,
    buildAsyncReducers,
    buildAsyncActions,
} from '@thecodingmachine/redux-toolkit-wrapper'
import {GetUnreadCount} from "@/Services/Notifications";

export default {
    initialState: buildAsyncState('fetchUnreadCount'),
    action: buildAsyncActions('notifications/fetchUnreadCount', GetUnreadCount),
    reducers: buildAsyncReducers({
        itemKey: 'unreadCount',
        errorKey: 'unreadCountState.error',
        loadingKey: 'unreadCountState.loading',
    }),
}
