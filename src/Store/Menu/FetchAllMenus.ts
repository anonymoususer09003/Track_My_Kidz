import {
    buildAsyncState,
    buildAsyncReducers,
    buildAsyncActions,
} from '@thecodingmachine/redux-toolkit-wrapper'
import FetchMenu from "@/Services/Menus/FetchMenu";

export default {
    initialState: buildAsyncState('fetchAll'),
    action: buildAsyncActions('menu/fetchAll', async () => {
        return await FetchMenu(false)
    }),
    reducers: buildAsyncReducers({
        itemKey: 'allMenus',
        errorKey: 'fetchAll.error', // Optionally, if you scoped variables, you can use a key with dot notation
        loadingKey: 'fetchAll.loading',
    }),
}
