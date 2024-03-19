import { buildSlice } from "@thecodingmachine/redux-toolkit-wrapper";
import FetchCountries from "@/Store/Places/FetchCountries";
import { CountryDTO } from '@/Models/CountryDTOs';

const sliceInitialState = {
  countries: null,
};

export default buildSlice("places", [FetchCountries], sliceInitialState)
  .reducer;

export interface PlaceState {
  countries: CountryDTO[];
  fetchCountries: {
    loading: boolean;
    error: any;
  };
}
