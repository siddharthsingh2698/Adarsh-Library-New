import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import AddStudent from './pages/AddStudent';
import EditStudent from './pages/EditStudent';
import SeatMap from './pages/SeatMap';
import CheckIn from './pages/CheckIn';
import FeeLedger from './pages/FeeLedger';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Configuration from './pages/Configuration';
import Kiosk from './pages/Kiosk';
import LibraryPage from './pages/LibraryPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/kiosk" element={<Kiosk />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"      element={<Dashboard />} />
            <Route path="students"       element={<Students />} />
            <Route path="students/add"   element={<AddStudent />} />
            <Route path="students/:id"   element={<EditStudent />} />
            <Route path="seats"          element={<SeatMap />} />
            <Route path="checkin"        element={<CheckIn />} />
            <Route path="fees"           element={<FeeLedger />} />
            <Route path="notifications"  element={<Notifications />} />
            <Route path="reports"        element={<Reports />} />
            <Route path="config"         element={<Configuration />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
