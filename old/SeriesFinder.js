export class PHCSeriesFinder extends HTMLElement {
  constructor() {
    super();
    this.seriesList = [];
  }

  async applyExternalStyles() {
    try {
      const response = await fetch('./SermonWidgets.css');
      const css = await response.text();
      const style = document.createElement('style');
      style.textContent = css;
      this.shadowRoot.appendChild(style);
    } catch (error) {
      console.error('Error applying external styles:', error);
    }
  }  

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });

    this.targetURL = this.getAttribute('target');

    if (!this.targetURL) {
      return console.error('Missing attribute: \'target\'');
    }

    this.wrapper = document.createElement('div');
    this.wrapper.id = 'series-finder-container'
    shadow.appendChild(this.wrapper);

    this.applyExternalStyles();
    this.fetchSeries();
  }

  async fetchSeries() {
    try {
      const response = await fetch(`http://localhost:3000/api/widgets/series`);
      this.seriesList = await response.json();
      this.update();
    } catch (error) {
      console.error('Failed to fetch series:', error);
    }
  }

  update() {
    // Logic to update the DOM elements to display the series list
    console.log(this.seriesList);

    this.wrapper.innerHTML = '';

    for (const index in this.seriesList) {
      const { Title, Display_Title, Series_Start_Date, UniqueFileId, Sermon_Series_ID, Series_UUID } = this.seriesList[index];
  
      const seriesCardDOM = document.createElement('a');
        seriesCardDOM.classList.add('series-card');
        seriesCardDOM.classList.add('fade-in');
        // seriesCardDOM.id = Series_UUID;
        seriesCardDOM.href = this.targetURL + '?id=' + Sermon_Series_ID;
        seriesCardDOM.setAttribute('idToTransition', Series_UUID)
        seriesCardDOM.style.animationDelay = `${50 * index}ms`;
      seriesCardDOM.innerHTML = `
        <div class="img-container">
          <img src="https://my.pureheart.org/ministryplatformapi/files/${UniqueFileId}" loading="lazy" alt="${Display_Title ?? Title}" id="${Series_UUID}">
        </div>
        <h1 class="title">${Display_Title ?? Title}</h1>
        <p class="subtitle">${new Date(Series_Start_Date).toLocaleDateString('en-us', {month: 'long', day: 'numeric', year: 'numeric'})}</p>
      `;
  
      this.wrapper.appendChild(seriesCardDOM);
    }
  }
}