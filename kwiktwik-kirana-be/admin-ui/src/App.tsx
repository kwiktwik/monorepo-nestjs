import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ScriptsDashboard from './pages/ScriptsDashboard';
import PhonePe from './pages/PhonePe';
import Razorpay from './pages/Razorpay';
import FeatureToggle from './pages/FeatureToggle';
import Login from './pages/Login';
import Notifications from './pages/Notifications';
import { PrivateRoute } from './components/PrivateRoute';

function App() {
  return (
    <Routes>
      {/* Redirect /admin to /admin/ */}
      <Route path="" element={<Navigate to="/" replace />} />

      {/* Protected admin routes - require authentication */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* Default route is the scripts runner */}
        <Route index element={<ScriptsDashboard />} />
        <Route path="phonepe" element={<PhonePe />} />
        <Route path="razorpay" element={<Razorpay />} />
        <Route path="feature-toggle" element={<FeatureToggle />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
      {/* Public login route */}
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
