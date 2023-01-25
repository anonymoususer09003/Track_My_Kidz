import { buildSlice } from "@thecodingmachine/redux-toolkit-wrapper";
import { CountryDTO } from "@/Models/CountryDTOs";
import FetchCountries from "@/Store/Places/FetchCountries";

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
