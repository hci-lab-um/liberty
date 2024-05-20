import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

// inject the react application to the element with id root
const root = document.getElementById('root');
createRoot(root).render(<App />);

// Register service worker to make the app work faster
// the serviceWorker.js file is a complementary file which was setup with create-react-app
serviceWorker.register();
