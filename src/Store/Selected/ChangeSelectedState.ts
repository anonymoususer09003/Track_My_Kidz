import { createAction } from '@reduxjs/toolkit'
import {SelectedState} from "@/Store/Selected/index";

interface PayloadInterface {
    payload: Partial<SelectedState>
}

export default {
    initialState: {},
    action: createAction<Partial<SelectedState>>('selected/changeSelectedState'),
    reducers(state: SelectedState, { payload }: PayloadInterface) {
        if (typeof payload.selectedPost !== 'undefined') {
            state.selectedPost = payload.selectedPost
        }
        if (typeof payload.selectedBlog !== 'undefined') {
            state.selectedBlog = payload.selectedBlog
        }
        if (typeof payload.selectedProduct !== 'undefined') {
            state.selectedProduct = payload.selectedProduct
        }
        if (typeof payload.schedulerData !== 'undefined') {
            state.schedulerData = payload.schedulerData
        }
        if (typeof payload.selectedUserData !== 'undefined') {
            state.selectedUserData = payload.selectedUserData
        }
        if (typeof payload.selectedAmount !== 'undefined') {
            state.selectedAmount = payload.selectedAmount
        }
        if (typeof payload.selectedBlogId !== 'undefined') {
            state.selectedBlogId = payload.selectedBlogId
        }
    },
}
