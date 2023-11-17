import { html, useState,useEffect } from '../util/preactCentral.js';

function SeriesCard({ target, img, title, subtitle, id, index }) {
  return html`
    <a href="${target}" class="series-card fade-in" style="animation-delay: ${50 * index}ms;">
      <div class="img-container">
        <img src="${img}" loading="lazy" alt="${title}" id="${id}" />
      </div>
      ${title && html`<h1 class="title">${title}</h1>`}
      ${subtitle && html`<p class="subtitle">${subtitle}</p>`}
    </a>
  `;
}

function SeriesFinder({ target }) {
  if (typeof target === 'undefined') {
    throw new Error('\'target\' prop is required for SeriesFinder component');
  }

  const [seriesList, setSeriesList] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/widgets/series')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setSeriesList(data))
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }, []); // The empty array ensures this effect runs once on mount

  // ${seriesList.map((series, i) => html`< ${SeriesCard} series="${JSON.stringify(series)}" index="${i}" />`)}
  return html`
    <div id="series-finder-container">
      ${seriesList.map((series, i) => {
        const { Title, Display_Title, Series_Start_Date, UniqueFileId, Sermon_Series_ID, Series_UUID } = series;
        return html`
        <${SeriesCard} 
          target="${target}?id=${Sermon_Series_ID}"
          img="https://my.pureheart.org/ministryplatformapi/files/${UniqueFileId}?thumbnail=true"
          title="${Display_Title ?? Title}"
          subtitle="${new Date(Series_Start_Date).toLocaleDateString('en-us', {month: 'long', day: 'numeric', year: 'numeric'})}"
          id="${Series_UUID}"
          index="${i}"
        />
        `;
      })}
    </div>
  `;
}

function SeriesDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const seriesID = urlParams.get('id');

  const [series, setSeries] = useState({});
  const [sermonsList, setSermonsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:3000/api/widgets/series/${seriesID}`),
      fetch(`http://localhost:3000/api/widgets/sermon-series/${seriesID}`)
    ]).then(async (responses) => {
      const [seriesResponse, sermonsResponse] = responses;

      if (!seriesResponse.ok || !sermonsResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const seriesData = await seriesResponse.json();
      const sermonsData = await sermonsResponse.json();
      setSeries(seriesData);
      setSermonsList(sermonsData);
    }).catch(error => {
      console.error('There was a problem with the fetch operation:', error);
      setError(error);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []); 

  if (error) {
    return html`<h1>Error Loading Data</h1>`;
  }

  if (isLoading) {
    return html`<h1>Loading...</h1>`;
  }

  if (!series.Series_UUID || !sermonsList.length) {
    console.log(series)
    console.log(sermonsList)
    return html`<h1>Not Found</h1>`;
  }

  return html`
    <div id="series-details-container">
      <div class="series-img-container">
        <img src="https://my.pureheart.org/ministryplatformapi/files/${series.UniqueFileId}" alt="${series.Display_Title ?? series.Title}" id="${series.Series_UUID}" />
      </div>
      <h1 class="series-title">${series.Display_Title ?? series.Title}</h1>
      <div class="sermon-list-container">
        ${sermonsList.map((sermon, i) => {
          const { Title, UniqueFileId, Sermon_UUID } = sermon;
          return html`
          <${SeriesCard} 
            target="#"
            img="https://my.pureheart.org/ministryplatformapi/files/${UniqueFileId}"
            title="${Title}"
            id="${Sermon_UUID}"
            index="${i}"
          />
          `;
        })}
      </div>
    </div>
  `;
}

export { SeriesFinder, SeriesDetails };