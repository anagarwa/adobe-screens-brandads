/* eslint-disable no-console, no-alert */
import {
  searchQueryIndexs,
} from '../../scripts/scripts.js';

// function publishPage() {
//   const publishButton = document.querySelector('helix-sidekick').shadowRoot.querySelector('.publish').firstElementChild;
//   publishButton.click();
// }
//
// function hidePublishButton() {
//   console.log('hiding publishButton');
//   const publishButton = document.querySelector('helix-sidekick').shadowRoot.querySelector('.publish');
//   publishButton.style.display = 'none';
// }

async function preflight({ detail }) {
  const sk = detail.data;
  console.log('already german page, just publish it');
  // const liveUrl = sk.status.webPath;
  // if (liveUrl.includes('/de/')) {
  //   // already publishing german, just publish
  //   console.log('already german page, just publish it');
  //   publishPage();
  // } else {
  //   const germanURI = liveUrl.replace('/en/', '/de/');
  //   // check if german version is in index
  //   const returnVal = await searchQueryIndexs(germanURI, 'news-de');
  //   if (returnVal) {
  //     // safe to publish
  //     console.log('found the german version in the index, okay to publish');
  //     publishPage();
  //   } else {
  //     // throw alert
  //     alert(`Unable to publish page. \n\nContent at ${germanURI} is not yet live.  \n\nPlease publish the german content first.`);
  //   }
  // }
}

const sk = document.querySelector('helix-sidekick');
sk.addEventListener('custom:preflight', preflight);
