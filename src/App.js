import React, { Component } from 'react';
import { createRoot } from 'react-dom/client'
import 'semantic-ui-css/semantic.min.css'
import './App.css';
import Main from './components/Main'
const {ipcRenderer} = window.require('electron')

class App extends Component {

componentDidMount(){
  // notify the main process that the React application was loaded successfully
  ipcRenderer.send('windowLoaded');    
}

  render() {
    return (
      <div>
        <Main/>
      </div>
    );
  }
}

const root = document.getElementById('root');
createRoot(root).render(<App />);
