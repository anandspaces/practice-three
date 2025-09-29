import SceneComponent from '../components/StlImageAnimationAlpha';

interface SceneProps {
  autoRotate?: boolean;
  title?: string;
  modelColor?: string;
  backgroundColor?: string;
  stlUrl?: string;
  height?: string;
  showControls?: boolean;
}

const Scene = SceneComponent as React.FC<SceneProps>;

function DashboardAlpha() {
  return (
    <div className="p-20 m-20 max-w-full mx-auto h-auto">
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