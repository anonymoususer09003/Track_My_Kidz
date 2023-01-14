import { buildSlice } from '@thecodingmachine/redux-toolkit-wrapper'

// This state is common to all the "user" module, and can be modified by any "user" reducers
const sliceInitialState = {
    serviceProviderMenus:[],
    allMenus:[],
}

export default buildSlice('menu', [], sliceInitialState).reducer

export interface MenuState {
    serviceProviderMenus:{},
    allMenus:{},
    fetchServiceProvider: {
        loading: boolean
        error: any
    }
    fetchAll: {
        loading: boolean
        error: any
    }
}
