class PHCSeriesDetails extends HTMLElement {
  constructor() {
    super();

    this.series = null;
    this.sermons = [];
  }

  async applyExternalStyles() {
    const response = await fetch('./SeriesDetails.css');
    const css = await response.text();
    const style = document.createElement('style');
    style.textContent = css;
    this.shadowRoot.appendChild(style);
  }

  connectedCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const shadow = this.attachShadow({ mode: "open" });

    this.targetURL = this.getAttribute('target');
    this.seriesID = urlParams.get('id');

    if (!this.targetURL) {
      return console.error('Missing attribute: \'target\'');
    }
    if (!this.seriesID) {
      return console.error('Missing series id');
    }


    this.wrapper = document.createElement('div');
    this.wrapper.id = 'series-finder-container'
    shadow.appendChild(this.wrapper);

    // this.applyExternalStyles();
    this.fetchSeries();
    this.fetchSermons();
  }

  async fetchSeries() {
    try {
      const response = await fetch(`http://localhost:3000/api/widgets/series/${this.seriesID}`);
      const seriesList = await response.json();
      this.series = seriesList[0];
      if (this.sermons.length > 0) this.update();
    } catch (error) {
      console.error('Failed to fetch series:', error);
    }
  }
  async fetchSermons() {
    try {
      const response = await fetch(`http://localhost:3000/api/widgets/sermon-series/${this.seriesID}`);
      this.sermons = await response.json();
      if (this.series !== null) this.update();
    } catch (error) {
      console.error('Failed to fetch series:', error);
    }
  }

  update() {
    console.log(this.series);
    console.log(this.sermons);
    // Logic to update the DOM elements to display the series list
    // console.log(this.seriesList);

    // this.wrapper.innerHTML = '';

    // this.loadSeriesSequentially(0);

    // const seriesListHTML = this.seriesList.map(series => {
    //   const { Title, Display_Title, Series_Start_Date, UniqueFileId } = series;
    //   return `
    //     <a href="#" class='series-card'>
    //       <img src="https://my.pureheart.org/ministryplatformapi/files/${UniqueFileId}?thumbnail=true" alt="${Display_Title ?? Title}" >
    //       <h1 class='series-title'>${Display_Title ?? Title}</h1>
    //       <p class='series-subtitle'>${new Date(Series_Start_Date).toLocaleDateString('en-us', {month: 'long', day: 'numeric', year: 'numeric'})}</p>
    //     </a>
    //   `
    // }).join('')

    // this.wrapper.innerHTML = seriesListHTML;
  }

  loadSeriesSequentially(index) {
    if (index >= this.seriesList.length) return;
  
    const series = this.seriesList[index];
    const { Title, Display_Title, Series_Start_Date, UniqueFileId, Sermon_Series_ID } = series;
  
    const img = new Image();
    img.src = `https://my.pureheart.org/ministryplatformapi/files/${UniqueFileId}`;
    img.alt = Display_Title ?? Title;
    img.onload = () => {
      const seriesCardDOM = document.createElement('a');
        seriesCardDOM.classList.add('series-card');
        seriesCardDOM.href = this.targetURL + '?id=' + Sermon_Series_ID;
      const seriesTitleDOM = document.createElement('h1');
        seriesTitleDOM.classList.add('series-title');
        seriesTitleDOM.textContent = Display_Title ?? Title;
      const seriesSubtitleDOM = document.createElement('p');
        seriesSubtitleDOM.classList.add('series-subtitle');
        seriesSubtitleDOM.textContent = new Date(Series_Start_Date).toLocaleDateString('en-us', {month: 'long', day: 'numeric', year: 'numeric'});
      
      seriesCardDOM.appendChild(img);
      seriesCardDOM.appendChild(seriesTitleDOM);
      seriesCardDOM.appendChild(seriesSubtitleDOM);
      this.wrapper.appendChild(seriesCardDOM);

      this.loadSeriesSequentially(index + 1);
    };
  }
}

customElements.define('phc-series-details', PHCSeriesDetails);