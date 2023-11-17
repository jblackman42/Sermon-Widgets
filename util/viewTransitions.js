const getPageContent = async (url) => {
  const response = await fetch(url);
  const text = await response.text();

  // Create a new DOM parser
  const parser = new DOMParser();
  // Parse the text into a document
  const doc = parser.parseFromString(text, 'text/html');

  return {
    head: doc.head.innerHTML,
    body: doc.body.innerHTML,
  };
}

const getLink = (href) => {
  const fullLink = new URL(href, location.href).href;
  
  return [...document.querySelectorAll('a')].find((link) =>
    link.href === fullLink
  );
}

const isBackNavigation = (navigateEvent) => {
  if (navigateEvent.navigationType === 'push' || navigateEvent.navigationType === 'replace') {
    return false;
  }
  if (
    navigateEvent.destination.index !== -1 &&
    navigateEvent.destination.index < navigation.currentEntry.index
    ) {
    return true;
  }
  return false;
}

const onLinkNavigate = async (callback) => {
  navigation.addEventListener('navigate', (event) => {
    const toUrl = new URL(event.destination.url);
  
    // skip animation if link is to another website
    if (location.origin != toUrl.origin) return;
  
    const fromPath = location.pathname;
    const isBack = isBackNavigation(event);
  
    event.intercept({
      async handler() {
        if (event.info === 'ignore') return;
          
        await callback({
          toPath: toUrl.pathname,
          fromPath,
          isBack,
        });
      }
    });
  })
}

// emulates a transition object with or without browser support
// allows for easier way to add classes to document element
const transitionHelper = async ({
  skipTransition = false,
  classNames = '',
  updateDOM
}) => {
  // if skipTransition or browser doesn't support view transitions
  if (skipTransition || !document.startViewTransition) {
    const updateCallbackDone = Promise.resolve(updateDOM()).then(() => null);

    return {
      ready: Promise.reject(Error('View transitions unsupported')),
      domUpdated: updateCallbackDone,
      updateCallbackDone,
      finished: updateCallbackDone
    };
  }

  // split classnames by space and remove null values
  const classNamesArray = classNames.split(/\s+/g).filter(Boolean);
  // add classes to html element
  document.documentElement.classList.add(...classNamesArray);
  
  const transition = document.startViewTransition(updateDOM);
  // remove classes from html element after transition is finished
  transition.finished.finally(() => {
    document.documentElement.classList.remove(...classNamesArray)
  })
}

onLinkNavigate(async ({ fromPath, toPath, isBack }) => {
  const { head, body } = await getPageContent(toPath);
  console.log('retrieved requested page content')

  // for (const elem of document.getElementsByClassName('transition-elem')) {
  //   elem.classList.remove('transition-elem');
  // }
  
  const linkElem = getLink(toPath);
  const idToTransition = linkElem.getAttribute('idToTransition');
  const elemToTransition = idToTransition ? document.getElementById(idToTransition) ?? linkElem : linkElem;
  if (elemToTransition) elemToTransition.classList.add('transition-elem');
  // document.getElementById('red').classList.add('transition-elem');
  
  const transition = transitionHelper({
    updateDOM() {
      document.body.innerHTML = body;
      document.head.innerHTML = head;
      
      // document.getElementById('red').classList.add('transition-elem');
      // const linkElem = getLink(fromPath);
      // const idToTransition = linkElem.getAttribute('idToTransition');
      const elemToTransition = idToTransition ? document.getElementById(idToTransition) ?? linkElem : linkElem;
      if (elemToTransition) elemToTransition.classList.add('transition-elem');
    }
  });

  transition.finished.finally(() => {
    for (const elem of document.getElementsByClassName('transition-elem')) {
      elem.classList.remove('transition-elem');
    }
  })
})
