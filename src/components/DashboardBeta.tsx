import Scene from './StlImageAnimationBeta';


function DashboardBeta() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">3D Model Viewer Dashboard</h1>
            <p className="mt-2 text-gray-600">Resizable STL viewers with various configurations</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          
          {/* Hero Viewer - Large Full Width */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">Featured Model</h2>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Full Width
              </span>
            </div>
            <Scene 
              width="100%" 
              height="500px"
              title="Large 3D Model Viewer"
              autoRotate={true}
              modelColor="#059669"
              backgroundColor="#f0fdf4"
              modelScale={1}
            />
          </section>

          {/* Medium Viewer */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">Medium Viewer</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                600×400px
              </span>
            </div>
            <div className="flex justify-center">
              <Scene 
                width={600} 
                height={400}
                title="Medium 3D Viewer"
                autoRotate={true}
                modelColor="#dc2626"
                backgroundColor="#fef2f2"
                modelScale={0.8}
              />
            </div>
          </section>

          {/* Small Viewers Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">Model Gallery</h2>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                Grid Layout
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Scene 
                width="100%" 
                height="250px"
                title="Purple Model"
                autoRotate={true}
                modelColor="#7c3aed"
                backgroundColor="#faf5ff"
                modelScale={0.6}
                showControls={false}
              />
              <Scene 
                width="100%" 
                height="250px"
                title="Orange Model"
                autoRotate={true}
                modelColor="#ea580c"
                backgroundColor="#fff7ed"
                modelScale={0.6}
                showControls={false}
              />
              <Scene 
                width="100%" 
                height="250px"
                title="Cyan Model"
                autoRotate={true}
                modelColor="#0891b2"
                backgroundColor="#ecfeff"
                modelScale={0.6}
                showControls={false}
              />
            </div>
          </section>

          {/* Responsive Viewer with Constraints */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">Responsive Viewer</h2>
              <span className="px-3 py-1 bg-pink-100 text-pink-800 text-sm font-medium rounded-full">
                Min/Max Constraints
              </span>
            </div>
            <div className="flex justify-center">
              <Scene 
                width="80%" 
                height="400px"
                minWidth="300px"
                maxWidth="800px"
                minHeight="200px"
                maxHeight="600px"
                title="Responsive Constrained Viewer"
                autoRotate={true}
                modelColor="#be185d"
                backgroundColor="#fdf2f8"
                modelScale={1.2}
                responsive={true}
              />
            </div>
          </section>

          {/* Compact Card Style Viewers */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">Compact Cards</h2>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                200×200px
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <Scene 
                width="200px" 
                height="200px"
                title="Mini Viewer"
                autoRotate={true}
                modelColor="#065f46"
                backgroundColor="#f0fdf4"
                modelScale={0.5}
                className="rounded-xl shadow-md hover:shadow-lg transition-shadow"
              />
              <Scene 
                width="200px" 
                height="200px"
                title="Card Viewer"
                autoRotate={true}
                modelColor="#7c2d12"
                backgroundColor="#fef7ed"
                modelScale={0.5}
                className="rounded-xl shadow-md hover:shadow-lg transition-shadow"
              />
              <Scene 
                width="200px" 
                height="200px"
                title="Thumb Viewer"
                autoRotate={true}
                modelColor="#1e1b4b"
                backgroundColor="#f1f5f9"
                modelScale={0.5}
                className="rounded-xl shadow-md hover:shadow-lg transition-shadow"
              />
            </div>
          </section>

          {/* Custom Layout Examples */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">Custom Layouts</h2>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
                Mixed Sizes
              </span>
            </div>
            
            {/* Asymmetric Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Scene 
                  width="100%" 
                  height="320px"
                  title="Primary Model View"
                  autoRotate={true}
                  modelColor="#0f766e"
                  backgroundColor="#f0fdfa"
                  modelScale={1}
                />
              </div>
              <div className="space-y-4">
                <Scene 
                  width="100%" 
                  height="150px"
                  title="Detail View 1"
                  autoRotate={true}
                  modelColor="#92400e"
                  backgroundColor="#fffbeb"
                  modelScale={0.7}
                  showControls={false}
                />
                <Scene 
                  width="100%" 
                  height="150px"
                  title="Detail View 2"
                  autoRotate={true}
                  modelColor="#5b21b6"
                  backgroundColor="#faf5ff"
                  modelScale={0.7}
                  showControls={false}
                />
              </div>
            </div>
          </section>

          {/* Statistics Section */}
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Dashboard Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-gray-600">Total Models</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">8</div>
                <div className="text-sm text-gray-600">Auto-rotating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">5</div>
                <div className="text-sm text-gray-600">Different Sizes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">100%</div>
                <div className="text-sm text-gray-600">Responsive</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default DashboardBeta;