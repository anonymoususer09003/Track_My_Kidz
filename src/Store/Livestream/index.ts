import { buildSlice } from '@thecodingmachine/redux-toolkit-wrapper'
import ChangeLivestreamState from '@/Store/Livestream/ChangeLivestreamState'

export default buildSlice('livestream', [ChangeLivestreamState], {
  livestreamOpen: false,
  livestreamUrl: null,
}).reducer

export interface LivestreamState {
  livestreamOpen: boolean
  livestreamUrl: string | null
}
