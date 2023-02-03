import { buildSlice } from "@thecodingmachine/redux-toolkit-wrapper";
import ChangeNavigationCustomState from "@/Store/Navigation/ChangeNavigationCustomState";

export default buildSlice("navigation", [ChangeNavigationCustomState], {
  navigationLeftDrawer: null,
  navigationRightDrawer: null,
  navigationFeaturedPage: null,
  activeNav: null,
}).reducer;

export interface NavigationCustomState {
  navigationLeftDrawer: any | null;
  navigationRightDrawer: any | null;
  navigationFeaturedPage: any | null;
  activeNav: any | null;
}
