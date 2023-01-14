import {
    buildAsyncState,
    buildAsyncReducers,
    buildAsyncActions,
} from '@thecodingmachine/redux-toolkit-wrapper'
import FetchMenu from "@/Services/Menus/FetchMenu";

export default {
    initialState: buildAsyncState('fetchServiceProvider'),
    action: buildAsyncActions('menu/fetchServiceProvider', async () => {
        return await FetchMenu(true)
    }),
    reducers: buildAsyncReducers({
        itemKey: 'serviceProviderMenus',
        errorKey: 'fetchServiceProvider.error', // Optionally, if you scoped variables, you can use a key with dot notation
        loadingKey: 'fetchServiceProvider.loading',
    }),
}
