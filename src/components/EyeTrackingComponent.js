// EyeTrackingComponent.js
import React, { useEffect } from 'react';

const EyeTrackingComponent = () => {
  useEffect(() => {
    // Check if webgazer has loaded
    if (window.webgazer) {
      window.webgazer.setGazeListener((data, timestamp) => {
        if (data) {
          console.log('Gaze data:', data); // Or handle the gaze data as needed
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

  return <div>Eye Tracking Enabled</div>;
};

export default EyeTrackingComponent;
