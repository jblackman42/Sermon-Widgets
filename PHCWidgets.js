import { render, html } from './util/preactCentral.js';

import widgetsRegistry from './widgets/index.js';

(() => {
  widgetsRegistry.forEach(widget => {
    const { name, component } = widget;
    
    document.querySelectorAll(name).forEach(elem => {
      // Create an object to hold the attributes
      const props = {};

      // Loop through attributes and add them to the props object
      for (const attribute of elem.attributes) {
        props[attribute.name] = attribute.value;
      }

      // Render the component with the collected attributes as props
      render(html`<${component} ...${props} />`, elem);
    });
  });
})();