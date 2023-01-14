import { buildSlice } from '@thecodingmachine/redux-toolkit-wrapper'
import ChangeLoginState from '@/Store/Authentication/ChangeLoginState'
import LoginStore from '@/Store/Authentication/LoginStore'
import LogoutStore from '@/Store/Authentication/LogoutStore'

export default buildSlice(
  'authentication',
  [LoginStore, LogoutStore, ChangeLoginState],
  {
    loggedIn: false,
  },
).reducer

export interface AuthenticationState {
  loggedIn: boolean
}
