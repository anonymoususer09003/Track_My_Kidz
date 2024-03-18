import {
  buildAsyncActions,
  buildAsyncReducers,
  buildAsyncState,
} from "@thecodingmachine/redux-toolkit-wrapper";
import {
  storeUserId,
  storeToken,
  storeUserType,
  storeId,
  storeIsSubscribed,
} from "@/Storage/MainAppStorage";
import ChangeStartUpState from "@/Store/Startup/ChangeStartUpState";
import ChangeUserState from "@/Store/User/FetchOne";
import ChangeLoginState from "@/Store/Authentication/ChangeLoginState";
import fetchOneUserService from "@/Services/User/FetchOne";

import ChangeUserTypeState from "@/Store/UserType/ChangeUserTypeState";

export default {
  initialState: buildAsyncState(),
  action: buildAsyncActions(
    "authentication/login",
    async (
      { token, userType, id, mainId, isSubscribed, callApi }: any,
      { dispatch
        // , rejectWithValue
      }
    ) => {
      await storeToken(token);
      await storeUserType(userType);
      await storeUserId(`${id}`);
      if (isSubscribed) {
        await storeIsSubscribed(isSubscribed);
      }
      await storeId(`${mainId}`);
      // const userId = `${id}`;
      // if (userId != null) {
      //   // dispatch(FetchOne.action(userId));
      //   dispatch(LoadAppointments.action());
      // }

      let res = await fetchOneUserService();
      console.log("res", res);
      // if (!res?.childTrackHistory) {
      //   // await BackgroundService.stop();
      // }
      // await BackgroundService.stop();
      await dispatch(
        ChangeUserState.action({
          item: res,
          fetchOne: { loading: false, error: null },
        })
      );

      //   dispatch(FetchCountries.action());
      // dispatch(LoadAds.action({ pageSize: 100 }));
      // dispatch(FetchNotifications.action());
      await dispatch(ChangeLoginState.action({ loggedIn: true }));
      dispatch(ChangeStartUpState.action({ loadingInitialData: false }));
      dispatch(
        ChangeUserTypeState.action({
          userType: userType,
        })
      );
    }
  ),
  reducers: buildAsyncReducers({ itemKey: null }), // We do not want to modify some item by default
};
