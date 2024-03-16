import {buildSlice} from '@thecodingmachine/redux-toolkit-wrapper';
import InitStartup from './Init';
import ChangeStartUpState from '../../Store/Startup/ChangeStartUpState';

export default buildSlice('startup', [InitStartup, ChangeStartUpState], {
  loadingInitialData: true,
}).reducer;

export interface StartupState {
  loadingInitialData: boolean;
  loading: boolean;
  error: any;
}
