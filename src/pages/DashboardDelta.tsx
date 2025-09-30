import Scene from '../components/StlImageAnimationDelta';

function DashboardDelta() {
   return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="p-4">
        <Scene 
          // STL file paths
          stlUrl1="/dentalai.stl"
          stlUrl2="/ROOTLIB/upper/grin-design-26.stl"
          
          // Dimensions
          width="600px" 
          height="600px"
          
          // Camera orbit rotation (rotates around both models)
          autoRotate={false}
          
          // Individual model scales
          modelScale1={20}  // Scale for model 1
          modelScale2={1}  // Scale for model 2
          
          // Colors
          modelColor1="#3b82f6"  // Blue for model 1
          modelColor2="#ef4444"  // Red for model 2
          backgroundColor="transparent"
          
          // Spacing between models
          spacing={80}
          
          // Initial orientation (in radians)
          rotation1={{ 
            x: Math.PI,     
            y: 0,
            z: 0 
          }}
          rotation2={{ 
            x: 0, 
            y: -Math.PI / 6, // -30 degrees
            z: 0 
          }}
          
          // Individual model spinning
          rotateModel1={true}   // Model 1 stays still
          rotateModel2={true}    // Model 2 spins
          rotationSpeed1={0}
          rotationSpeed2={0.02}  // Speed for model 2
          
          className="rounded-xl shadow-2xl"
        />
      </div>
    </div>
  );
}

export default DashboardDelta;