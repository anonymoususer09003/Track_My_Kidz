import {
  buildAsyncActions,
  buildAsyncReducers,
  buildAsyncState,
} from "@thecodingmachine/redux-toolkit-wrapper";
import {
  clearToken,
  clearUserId,
  clearUserType,
  removeCountryDetail,
  removeInstructorDetail,
  removeStudentParentDetail,
  removeUserId,
  removeUserType,
  removeStoreUserType,
} from "@/Storage/MainAppStorage";
import ChangeLoginState from "@/Store/Authentication/ChangeLoginState";

export default {
  initialState: buildAsyncState(),
  action: buildAsyncActions(
    "authentication/logout",
    async (token, { dispatch, rejectWithValue }) => {
      await clearToken();
      await clearUserId();
      await clearUserType();
      await removeInstructorDetail();
      await removeUserId();
      await removeUserType();
      await removeStoreUserType();
      await removeStudentParentDetail();
      await dispatch(ChangeLoginState.action({ loggedIn: false }));
    }
  ),
  reducers: buildAsyncReducers({ itemKey: null }), // We do not want to modify some item by default
};
