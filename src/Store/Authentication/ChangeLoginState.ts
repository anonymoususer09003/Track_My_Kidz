import { createAction } from '@reduxjs/toolkit'
import { AuthenticationState } from '@/Store/Authentication/index'

interface PayloadInterface {
  payload: Partial<AuthenticationState>
}
export default {
  initialState: { loggedIn: false },
  action: createAction<Partial<AuthenticationState>>(
    'authentication/changeLoginState',
  ),
  reducers(state: AuthenticationState, { payload }: PayloadInterface) {
    if (typeof payload.loggedIn !== 'undefined') {
      state.loggedIn = payload.loggedIn
    }
  },
}
