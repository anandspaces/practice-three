import Scene from '../components/StlImageAnimationZeta';

export default function DashboardZeta() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-gray-500/10 rounded-full blur-3xl top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-gray-500/10 rounded-full blur-3xl bottom-20 -right-20 animate-pulse delay-1000"></div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 max-w-7xl w-full">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          
          {/* Content grid */}
          <div className="grid md:grid-cols-2 gap-0">
            
            {/* Left side - Text content */}
            <div className="p-8 md:p-12 flex flex-col justify-center relative">
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-600/20 to-transparent pointer-events-none"></div>
              
              <div className="relative z-10">

                {/* Main heading with sophisticated styling */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  <span
                    className="block bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent drop-shadow-2xl"
                    // style={{
                    //   textShadow:
                    //     "0 0 30px rgba(156, 163, 175, 0.6), 0 0 60px rgba(209, 213, 219, 0.4)", 
                    //   // gray-400 and gray-300 tones
                    // }}
                  >
                    Dental AI
                  </span>
                </h1>


                {/* Subheading */}
                <p className="text-xl md:text-2xl text-gray-100/90 mb-8 font-light leading-relaxed">
                  Reimagining Lab Workflow with{' '}
                  <span className="text-gray-300 font-semibold">AI Efficiency</span>
                </p>

                {/* Feature list */}
                <div className="space-y-3 mb-8">
                  {['Precision Modeling', 'Smart Analysis', 'Instant Results'].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-100/80">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4">
                  <button className="group relative bg-gradient-to-r from-gray-500 to-gray-500 text-white px-8 py-4 rounded-full font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-gray-500/50 hover:scale-105">
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  
                  <button className="border-2 border-gray-300/50 text-gray-100 hover:bg-white/10 px-8 py-4 rounded-full font-semibold text-base transition-all duration-300 backdrop-blur-sm hover:border-gray-300">
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            {/* Right side - 3D Viewer */}
            <div className="relative flex items-center justify-center p-8 md:p-12 bg-gradient-to-bl from-gray-950/30 to-transparent">
              {/* Decorative elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gray-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-500/5 rounded-full blur-3xl"></div>
              </div>

              {/* 3D Viewer container with glass effect */}
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-gray-400/30 rounded-tl-2xl"></div>
                  <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-gray-400/30 rounded-br-2xl"></div>
                  
                  <Scene
                    width="100%"
                    height="500px"
                    autoRotate={true}
                    modelColor="#c0c0c0" // silver
                    backgroundColor="transparent"
                    modelScale={0.7}
                    className="rounded-2xl"
                  />
                  
                  {/* Info badge on viewer */}
                  {/* <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-md rounded-lg px-4 py-2 border border-white/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-200 font-medium">Interactive 3D Model</span>
                      <span className="text-gray-300">• Live</span>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}