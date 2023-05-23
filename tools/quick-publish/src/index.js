import React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider, defaultTheme} from '@adobe/react-spectrum';
import MyComponent from './MyComponent';

const app = document.getElementById("app");
if (app) {
  ReactDOM.render(<Provider theme={defaultTheme}><MyComponent /></Provider>, app);
}
