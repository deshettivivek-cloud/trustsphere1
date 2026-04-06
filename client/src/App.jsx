import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

const ComingSoon = ({ page }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">{page}</h2>
      <p className="text-slate-500">Coming in next steps...</p>
    </div>
  </div>
)

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<ComingSoon page="Search Workers" />} />
          <Route path="/worker/:id" element={<ComingSoon page="Worker Profile" />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/worker-profile" element={<ProtectedRoute><ComingSoon page="Edit Worker Profile" /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><ComingSoon page="My Bookings" /></ProtectedRoute>} />
          <Route path="/my-jobs" element={<ProtectedRoute><ComingSoon page="Job Requests" /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App