import Scene from '../components/StlImageAnimationLambda';

export default function DashboardLambda() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden relative">

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Content grid */}
          <div className="grid lg:grid-cols-2 gap-0">
            
            {/* Left side - Text content */}
            <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center relative order-2 lg:order-1">
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0  pointer-events-none"></div>
              
              <div className="relative z-10">
                {/* Main heading with sophisticated styling */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                  <span className="block bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent">
                    Dental AI
                  </span>
                </h1>

                {/* Subheading */}
                <p className="text-lg sm:text-xl md:text-2xl text-gray-100/90 mb-6 sm:mb-8 font-light leading-relaxed">
                  Reimagining Lab Workflow with{' '}
                  <span className="text-gray-300 font-semibold">AI Efficiency</span>
                </p>

                {/* Feature list */}
                <div className="space-y-3 mb-6 sm:mb-8">
                  {['Precision Modeling', 'Smart Analysis', 'Instant Results'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-100/80">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                      <span className="text-sm sm:text-base font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    className="group relative bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-gray-500/50 hover:scale-105 active:scale-95"
                    aria-label="Get started with Dental AI"
                  >
                    <span className="relative z-10">Get Started</span>
                  </button>
                  
                  <button 
                    className="border-2 border-gray-300/50 text-gray-100 hover:bg-white/10 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 backdrop-blur-sm hover:border-gray-300 active:scale-95"
                    aria-label="Learn more about Dental AI"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            {/* Right side - 3D Viewer */}
            <div className="relative flex items-center justify-center p-6 sm:p-8 md:p-12 order-1 lg:order-2">
              <div className="relative w-full">
                <Scene
                  stlUrl1="/Theta/upper_new.stl"
                  stlUrl2="/Theta/lower_new.stl"
                  stlUrl3="/Theta/crown_new.stl"
                  model1AnimationConfig={{
                    startScale: 0.7,
                    peakScale: 0.7,
                    startPosition: { x: 0, y: 0, z: 0 },
                    peakPosition: { x: 0, y: 0, z: 0 },
                    startRotation: { x: Math.PI, y: Math.PI, z: Math.PI },
                    peakRotation: { x: Math.PI, y: Math.PI, z: Math.PI },
                  }}
                  model2AnimationConfig={{
                    startScale: 0.7,
                    peakScale: 0.7,
                    startPosition: { x: 0, y: 0, z: 0 },
                    peakPosition: { x: 0, y: 0, z: 0 },
                    startRotation: { x: 0, y: 0, z: 0 },
                    peakRotation: { x: 0, y: 0, z: 0 },
                  }}
                  model3AnimationConfig={{
                    startScale: 0.7,
                    peakScale: 1.5,
                    startPosition: { x: 0, y: 0, z: 0 },
                    peakPosition: { x: 0, y: 0, z: 0 },
                    startRotation: { x: 0, y: 0, z: 0 },
                    peakRotation: { x: 0, y: 0, z: 0 },
                  }}
                  width="100%"
                  height="500px"
                  autoRotate={false}
                  modelColor="#ffffff"
                  backgroundColor="transparent"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}