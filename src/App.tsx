import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import DashboardAlpha from './components/DashboardAlpha'
import DashboardBeta from './components/DashboardBeta'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/alpha" element={<DashboardAlpha />} />
        <Route path="/beta" element={<DashboardBeta />} />
      </Routes>
    </Router>
  )
}

export default App
