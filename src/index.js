import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

// inject the react application to the element with id root
ReactDOM.render(<App />, document.getElementById('root'));

// Register service worker to make the app work faster
// the serviceWorker.js file is a complementary file which was setup with create-react-app
serviceWorker.register();
