import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './components/ui/Toast';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import ProtectedRoute from './components/auth/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import RegisterPatient from './pages/RegisterPatient';
import RegisterDoctor from './pages/RegisterDoctor';
import VerifyOtp from './pages/VerifyOtp';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorSearch from './pages/DoctorSearch';
import DoctorProfile from './pages/DoctorProfile';
import MyAppointments from './pages/MyAppointments';
import ManageSlots from './pages/ManageSlots';
import ConsultationChat from './pages/ConsultationChat';
import ConsultationHistory from './pages/ConsultationHistory';
import BookAppointment from './pages/BookAppointment';
import RescheduleAppointment from './pages/RescheduleAppointment';
import SymptomChecker from './pages/SymptomChecker';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
        <ToastProvider>
        <div className="min-h-screen bg-gray-50 pb-16 sm:pb-0">
          <Navbar />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register/patient" element={<RegisterPatient />} />
            <Route path="/register/doctor" element={<RegisterDoctor />} />
            <Route path="/verify" element={<VerifyOtp />} />

            {/* Patient */}
            <Route path="/symptom-checker" element={
              <ProtectedRoute role="patient"><SymptomChecker /></ProtectedRoute>
            } />
            <Route path="/patient/dashboard" element={
              <ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>
            } />
            <Route path="/doctors" element={
              <ProtectedRoute><DoctorSearch /></ProtectedRoute>
            } />
            <Route path="/doctors/:id" element={
              <ProtectedRoute><DoctorProfile /></ProtectedRoute>
            } />
            <Route path="/book/:doctorId" element={
              <ProtectedRoute role="patient"><BookAppointment /></ProtectedRoute>
            } />
            <Route path="/appointments/:id/reschedule" element={
              <ProtectedRoute role="patient"><RescheduleAppointment /></ProtectedRoute>
            } />

            {/* Doctor */}
            <Route path="/doctor/dashboard" element={
              <ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>
            } />
            <Route path="/doctor/slots" element={
              <ProtectedRoute role="doctor"><ManageSlots /></ProtectedRoute>
            } />

            {/* Shared (both roles) */}
            <Route path="/appointments" element={
              <ProtectedRoute><MyAppointments /></ProtectedRoute>
            } />
            <Route path="/consultation/:id" element={
              <ProtectedRoute><ConsultationChat /></ProtectedRoute>
            } />
            <Route path="/consultations" element={
              <ProtectedRoute><ConsultationHistory /></ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <MobileNav />
        </div>
        </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
