import {
    buildAsyncState,
    buildAsyncReducers,
    buildAsyncActions,
} from '@thecodingmachine/redux-toolkit-wrapper'
import {GetAllCountries} from "@/Services/PlaceServices";

export default {
    initialState: buildAsyncState('fetchCountries'),
    action: buildAsyncActions('places/fetchCountries', GetAllCountries),
    reducers: buildAsyncReducers({
        itemKey: 'countries',
        errorKey: 'fetchCountries.error', // Optionally, if you scoped variables, you can use a key with dot notation
        loadingKey: 'fetchCountries.loading',
    }),
}
