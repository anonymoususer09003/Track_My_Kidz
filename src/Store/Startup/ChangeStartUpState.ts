import { createAction } from '@reduxjs/toolkit'
import { StartupState } from '@/Store/Startup/index'

interface PayloadInterface {
  payload: Partial<StartupState>
}
export default {
  initialState: { loggedIn: false },
  action: createAction<Partial<StartupState>>('startup/changeStartUpState'),
  reducers(state: StartupState, { payload }: PayloadInterface) {
    if (typeof payload.loadingInitialData !== 'undefined') {
      state.loadingInitialData = payload.loadingInitialData
    }
  },
}
