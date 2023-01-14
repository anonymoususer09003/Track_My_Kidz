import { createAction } from '@reduxjs/toolkit'
import { LivestreamState } from '@/Store/Livestream/index'

interface PayloadInterface {
  payload: Partial<LivestreamState>
}

export default {
  initialState: {},
  action: createAction<Partial<LivestreamState>>(
    'livestream/changeLivestreamState',
  ),
  reducers(state: LivestreamState, { payload }: PayloadInterface) {
    if (typeof payload.livestreamUrl !== 'undefined') {
      state.livestreamUrl = payload.livestreamUrl
    }
    if (typeof payload.livestreamOpen !== 'undefined') {
      state.livestreamOpen = payload.livestreamOpen
    }
  },
}
