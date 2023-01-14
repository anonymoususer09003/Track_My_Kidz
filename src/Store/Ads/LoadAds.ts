import {
  buildAsyncActions,
  buildAsyncReducers,
  buildAsyncState,
} from "@thecodingmachine/redux-toolkit-wrapper";
import { GetAdvertisementBanner } from "@/Services/BlogServices";

export default {
  initialState: buildAsyncState("loadAds"),
  action: buildAsyncActions("ads/loadAds", async function () {
    // const resp = await GetAdvertisementBanner({pageSize: 100})
    // return resp.data
    return [];
  }),
  reducers: buildAsyncReducers({
    errorKey: "loadAds.error", // Optionally, if you scoped variables, you can use a key with dot notation
    loadingKey: "loadAds.loading",
  }),
};
