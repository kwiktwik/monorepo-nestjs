import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ScriptsDashboard from './pages/ScriptsDashboard';
import PhonePe from './pages/PhonePe';
import Razorpay from './pages/Razorpay';
import Login from './pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Default route is the scripts runner */}
        <Route index element={<ScriptsDashboard />} />
        <Route path="phonepe" element={<PhonePe />} />
        <Route path="razorpay" element={<Razorpay />} />
      </Route>
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
