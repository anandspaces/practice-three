import React from 'react';

// Define the expected props interface
interface SceneProps {
  autoRotate?: boolean;
  title?: string;
  modelColor?: string;
  backgroundColor?: string;
  stlUrl?: string;
  height?: string;
  showControls?: boolean;
}

// Import the Scene component
import SceneComponent from './StlImageAnimationAlpha';

// Type assertion for the imported component
const Scene = SceneComponent as React.FC<SceneProps>;

function DashboardAlpha() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Scene 
        autoRotate={true}
        title="Auto-Rotating 3D Model"
        modelColor="#2563eb"
        backgroundColor="#f8fafc"
      />
    </div>
  );
}

export default DashboardAlpha;