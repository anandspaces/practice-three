import Scene from './StlImageAnimationGamma';

function DashboardGamma() {
  return (
    <>
    <div className='flex justify-center items-center h-screen'>
      {/* Background image */}
      <img src="/holo.png" alt="Logo" className="absolute inset-0 object-cover w-full h-full" />
      <div className="p-4 bg-transparent">
        <Scene 
          width="400px" 
          height="400px"
          title="3D Viewer"
          autoRotate={true}
          modelColor="#ffffff" // white
          backgroundColor="transparent"
          modelScale={0.7}
          className="rounded-xl"
          showControls={true}
          />
      </div>
    </div>
    </>
  );
}

export default DashboardGamma;