/* eslint-disable no-console, no-alert */
// import {
//   searchQueryIndexs,
// } from '../../scripts/scripts.js';

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

async function pushevent({ detail }) {
  const sk = detail.data;
  console.log('I am into push event');
}

const sk = document.querySelector('helix-sidekick');
sk.addEventListener('custom:pushevent', pushevent);
