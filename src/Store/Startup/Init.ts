import {
  buildAsyncState,
  buildAsyncActions,
  buildAsyncReducers,
} from '@thecodingmachine/redux-toolkit-wrapper'
import { clearToken, loadId, loadToken, loadUserId, loadUserType } from '@/Storage/MainAppStorage'
import LoginStore from '@/Store/Authentication/LoginStore'
import LogoutStore from '@/Store/Authentication/LogoutStore'
import ChangeStartUpState from '@/Store/Startup/ChangeStartUpState'
import FetchCountries from "@/Store/Places/FetchCountries";

export default {
  initialState: buildAsyncState(),
  action: buildAsyncActions('startup/init', async (args, { dispatch }) => {
    // Timeout to fake waiting some process
    const token = await loadToken()
    const user_type = await loadUserType();
    const userId = await loadUserId();
    const mainId = await loadId();
    if (token && user_type) {
      await dispatch(LoginStore.action({ token: token, userType: user_type, id: userId, mainId: mainId }));
    } else {
      await dispatch(LogoutStore.action())
    }
    dispatch(FetchCountries.action())
    await dispatch(ChangeStartUpState.action({ loadingInitialData: false }))
  }),
  reducers: buildAsyncReducers({ itemKey: null }), // We do not want to modify some item by default
}
