import {buildSlice} from '@thecodingmachine/redux-toolkit-wrapper'
import LoadAds from "@/Store/Ads/LoadAds";

const sliceInitialState = {
    item: [],
}

export default buildSlice('ads', [LoadAds], sliceInitialState).reducer

export interface AdsState {
    item: any[]
    loadAds: {
        loading: boolean
        error: any
    }
}
