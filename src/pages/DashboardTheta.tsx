import Scene from '../components/StlImageAnimationTheta';

export default function DashboardTheta() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-gray-500/10 rounded-full blur-3xl top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-gray-500/10 rounded-full blur-3xl bottom-20 -right-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          
          {/* Content grid */}
          <div className="grid lg:grid-cols-2 gap-0">
            
            {/* Left side - Text content */}
            <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center relative order-2 lg:order-1">
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-600/20 to-transparent pointer-events-none"></div>
              
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
            <div className="relative flex items-center justify-center p-6 sm:p-8 md:p-12 bg-gradient-to-bl from-gray-950/30 to-transparent order-1 lg:order-2">
              {/* Decorative elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gray-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-500/5 rounded-full blur-3xl"></div>
              </div>

              {/* 3D Viewer container with glass effect */}
              <div className="relative w-full max-w-md">
                <div className="relative bg-white/5 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-16 sm:w-20 h-16 sm:h-20 border-t-2 border-l-2 border-gray-400/30 rounded-tl-2xl pointer-events-none z-10"></div>
                  <div className="absolute bottom-0 right-0 w-16 sm:w-20 h-16 sm:h-20 border-b-2 border-r-2 border-gray-400/30 rounded-br-2xl pointer-events-none z-10"></div>
                  
                  <Scene
                    stlUrl1="/lower.stl"
                    stlUrl2="/upper.stl"
                    stlUrl3="/ROOTLIB/combined/grin-design-26.stl"
                    model1Transform={{
                      position: { x: 0, y: 5, z: 5 },
                      scale: 0.7
                    }}
                    model2Transform={{
                      position: { x: 0, y: -5, z: -5 },
                      scale: 0.7
                    }}
                    model3Transform={{
                      position: { x: 0, y: 0, z: 0 },
                      scale: 0.7
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
    </div>
  );
}