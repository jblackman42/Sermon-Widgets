import Counter from "./Counter.js";
import { SeriesFinder, SeriesDetails } from "./SeriesWidgets.js";

export default [
  {
    name: 'counter',
    component: Counter
  },
  {
    name: 'phc-series-finder',
    component: SeriesFinder
  },
  {
    name: 'phc-series-details',
    component: SeriesDetails
  },
];