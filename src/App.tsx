import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DashboardAlpha from './pages/DashboardAlpha';
import DashboardBeta from './pages/DashboardBeta';
import DashboardGamma from './pages/DashboardGamma';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/alpha" element={<DashboardAlpha />} />
        <Route path="/beta" element={<DashboardBeta />} />
        <Route path="/gamma" element={<DashboardGamma />} />
      </Routes>
    </Router>
  )
}

export default App
