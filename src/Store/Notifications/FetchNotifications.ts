import {
    buildAsyncState,
    buildAsyncReducers,
    buildAsyncActions,
} from '@thecodingmachine/redux-toolkit-wrapper'
import {GetNotifications} from "@/Services/Notifications";

export default {
    initialState: buildAsyncState('fetchNotifications'),
    action: buildAsyncActions('notifications/fetchNotifications', GetNotifications),
    reducers: buildAsyncReducers({
        itemKey: 'notifications',
        errorKey: 'notificationsState.error',
        loadingKey: 'notificationsState.loading',
    }),
}
