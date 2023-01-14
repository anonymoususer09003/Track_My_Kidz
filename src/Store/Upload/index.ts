import { buildSlice } from '@thecodingmachine/redux-toolkit-wrapper'
import ChangeUploadState from '@/Store/Upload/ChangeUploadState'

export default buildSlice('upload', [ChangeUploadState], {
  percentage: 0,
}).reducer

export interface UploadState {
  percentage: number
}
