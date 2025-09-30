import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DashboardAlpha from './pages/DashboardAlpha';
import DashboardBeta from './pages/DashboardBeta';
import DashboardGamma from './pages/DashboardGamma';
import DashboardDelta from './pages/DashboardDelta';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/alpha" element={<DashboardAlpha />} />
        <Route path="/beta" element={<DashboardBeta />} />
        <Route path="/gamma" element={<DashboardGamma />} />
        <Route path="/delta" element={<DashboardDelta />} />
      </Routes>
    </Router>
  )
}

export default App
