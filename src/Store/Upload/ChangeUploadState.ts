import { createAction } from '@reduxjs/toolkit'
import { UploadState } from '@/Store/Upload/index'

interface PayloadInterface {
  payload: Partial<UploadState>
}

export default {
  initialState: {},
  action: createAction<Partial<UploadState>>('upload/changeUploadState'),
  reducers(state: UploadState, { payload }: PayloadInterface) {
    if (typeof payload.percentage !== 'undefined') {
      state.percentage = payload.percentage
    }
  },
}
