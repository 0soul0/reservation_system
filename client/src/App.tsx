import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './pages/Admin/AdminLayout';
import Members from './pages/Admin/Members';
import Bookings from './pages/Admin/Bookings';
import Activity from './pages/Admin/Activity';
import ActivityEdit from './pages/Admin/ActivityEdit';
import OpeningHours from './pages/Admin/OpeningHours';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="members" replace />} />
          <Route path="members" element={<Members />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="activity" element={<Activity />} />
          <Route path="activity/:id" element={<ActivityEdit />} />
          <Route path="openinghours" element={<OpeningHours />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
