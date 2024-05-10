// EyeTrackingComponent.js
import { ipcRenderer } from 'electron';
import React, { useEffect } from 'react';

console.log('EyeTrackingComponent.js');

const EyeTrackingComponent = () => {
  useEffect(() => {
    // Check if webgazer has loaded
    if (window.webgazer) {

      window.webgazer.showVideo(false);
      window.webgazer.showPredictionPoints(false);

      window.webgazer.setGazeListener((data, timestamp) => {
        if (data) {
          const simpleData = {
            x: data.x,
            y: data.y,
          };
          
          ipcRenderer.send('gaze-data', simpleData);
        }
      }).begin();
    }

    // Clean up the gaze listener when the component unmounts
    return () => {
      if (window.webgazer) {
        window.webgazer.end();
      }
    };
  }, []);

  return <div></div>;
};

export default EyeTrackingComponent;
