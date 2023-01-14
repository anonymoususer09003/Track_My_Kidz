import { createAction } from '@reduxjs/toolkit'
import { NavigationCustomState } from '@/Store/Navigation/index'

interface PayloadInterface {
  payload: Partial<NavigationCustomState>
}

export default {
  initialState: {},
  action: createAction<Partial<NavigationCustomState>>(
    'navigation/changeNavigationCustomState',
  ),
  reducers(state: NavigationCustomState, { payload }: PayloadInterface) {
    if (typeof payload.navigationLeftDrawer !== 'undefined') {
      state.navigationLeftDrawer = payload.navigationLeftDrawer
    }
    if (typeof payload.navigationRightDrawer !== 'undefined') {
      state.navigationRightDrawer = payload.navigationRightDrawer
    }
    if (typeof payload.navigationFeaturedPage !== 'undefined') {
      state.navigationFeaturedPage = payload.navigationFeaturedPage
    }
  },
}
