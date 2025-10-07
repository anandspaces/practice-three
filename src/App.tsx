import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DashboardAlpha from './pages/DashboardAlpha';
import DashboardBeta from './pages/DashboardBeta';
import DashboardGamma from './pages/DashboardGamma';
import DashboardDelta from './pages/DashboardDelta';
import DashboardEpsilon from './pages/DashboardEpsilon';
import DashboardZeta from './pages/DashboardZeta';
import DashboardEta from './pages/DashboardEta';
import DashboardTheta from './pages/DashboardTheta';
import DashboardIota from './pages/DashboardIota';
import DashboardKappa from './pages/DashboardKappa';
import DashboardLambda from './pages/DashboardLambda';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/alpha" element={<DashboardAlpha />} />
        <Route path="/beta" element={<DashboardBeta />} />
        <Route path="/gamma" element={<DashboardGamma />} />
        <Route path="/delta" element={<DashboardDelta />} />
        <Route path="/epsilon" element={<DashboardEpsilon />} />
        <Route path="/zeta" element={<DashboardZeta />} />
        <Route path="/eta" element={<DashboardEta />} />
        <Route path="/theta" element={<DashboardTheta />} />
        <Route path="/iota" element={<DashboardIota />} />
        <Route path="/kappa" element={<DashboardKappa />} />
        <Route path="/lambda" element={<DashboardLambda />} />
      </Routes>
    </Router>
  )
}

export default App
