class PHCSeriesFinder extends HTMLElement {
  constructor() {
    super();
    this.seriesList = [];
  }

  async applyExternalStyles() {
    const response = await fetch('./SeriesFinder.css');
    const css = await response.text();
    const style = document.createElement('style');
    style.textContent = css;
    this.shadowRoot.appendChild(style);
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
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

    const seriesListHTML = this.seriesList.map(series => {
      const { Title, Display_Title, Subtitle, UniqueFileId } = series;
      return `
        <img src="https://my.pureheart.org/ministryplatformapi/files/${UniqueFileId}" alt="${Display_Title ?? Title}" >
      `
    }).join('')

    this.wrapper.innerHTML = seriesListHTML;
  }
}

customElements.define('phc-series-finder', PHCSeriesFinder);