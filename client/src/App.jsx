import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/navbar";
import Footer from "./components/Footer";
import FloatingCart from "./components/FloatingCart";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import Services from "./pages/Services";
import ServiceCategory from "./pages/ServiceCategory";
import Cart from "./pages/Cart";
import CreateProfile from "./pages/CreateProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Role-specific pages
import RoleSelect from "./pages/RoleSelect";
import CustomerLogin from "./pages/CustomerLogin";
import WorkerLogin from "./pages/WorkerLogin";
import CustomerRegister from "./pages/CustomerRegister";
import WorkerRegister from "./pages/WorkerRegister";
import CustomerDashboard from "./pages/CustomerDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />

                {/* Role selection */}
                <Route path="/get-started" element={<RoleSelect />} />

                {/* Role-specific auth pages */}
                <Route path="/login/customer" element={<CustomerLogin />} />
                <Route path="/login/worker" element={<WorkerLogin />} />
                <Route path="/register/customer" element={<CustomerRegister />} />
                <Route path="/register/worker" element={<WorkerRegister />} />

                {/* Backward-compatible redirectors */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Service Marketplace */}
                <Route path="/services" element={<Services />} />
                <Route path="/services/:category" element={<Services />} />
                <Route path="/cart" element={<Cart />} />

                {/* Role-specific dashboards (protected) */}
                <Route
                  path="/dashboard/customer"
                  element={
                    <ProtectedRoute>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/worker"
                  element={
                    <ProtectedRoute>
                      <WorkerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Backward-compatible dashboard redirector */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/create-profile"
                  element={
                    <ProtectedRoute>
                      <CreateProfile />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/search"
                  element={
                    <ProtectedRoute>
                      <Search />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>

            <FloatingCart />
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;