import Scene from '../components/StlImageAnimationEta';

export default function DashboardEta() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 p-8">
      {/* Main Heading with Integrated 3D Model */}
      <div className="flex items-center justify-center gap-0 mb-8">
        {/* "Dental A" part with 3D effect */}
        <h1 
          className="text-9xl font-black tracking-tight"
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: `
              0px 1px 0px #d1d5db,
              0px 2px 0px #c0c0c0,
              0px 3px 0px #b0b0b0,
              0px 4px 0px #a0a0a0,
              0px 5px 0px #909090,
              0px 6px 0px #808080,
              0px 7px 1px rgba(0, 0, 0, 0.1),
              0px 0px 5px rgba(0, 0, 0, 0.1),
              0px 2px 4px rgba(0, 0, 0, 0.3),
              0px 5px 10px rgba(0, 0, 0, 0.3),
              0px 10px 20px rgba(0, 0, 0, 0.25),
              0px 20px 40px rgba(0, 0, 0, 0.2)
            `,
            filter: 'drop-shadow(0 25px 30px rgba(0, 0, 0, 0.3))',
            marginRight: '-10px',
            fontWeight: '900',
            letterSpacing: '0.02em',
            position: 'relative'
          }}
        >
          Dental A
        </h1>
        
        {/* 3D Model replacing "I" */}
        <div className="relative" style={{ width: '120px', height: '180px', marginLeft: '-10px' }}>
          {/* Glow effect behind the model - silver toned */}
          <div 
            className="absolute inset-0 blur-2xl opacity-40"
            style={{
              background: 'radial-gradient(circle, rgba(192, 192, 192, 0.7) 0%, rgba(156, 163, 175, 0.4) 50%, transparent 70%)',
            }}
          />
          
          <Scene
            width="120px"
            height="180px"
            autoRotate={true}
            modelColor="#d4d4d4"
            backgroundColor="transparent"
            modelScale={0.5}
            showControls={false}
            className="relative z-10"
          />
        </div>
      </div>
      
      {/* Subheading with better styling */}
      <div className="text-center max-w-2xl mb-8">
        <p 
          className="text-xl md:text-2xl font-light leading-relaxed"
          style={{
            color: 'rgba(243, 244, 246, 0.9)',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}
        >
          Reimagining Lab Workflow with{' '}
          <span 
            className="font-semibold"
            style={{
              background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            AI Efficiency
          </span>
        </p>
      </div>
      
      {/* Decorative Elements - silver toned */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-gray-400 rounded-full opacity-5 blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gray-500 rounded-full opacity-5 blur-3xl" />
    </div>
  );
}