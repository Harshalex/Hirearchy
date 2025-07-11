import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import TalentLayout from './layouts/TalentLayout';
import Dashboard from './pages/Dashboard';
import TalentSearchPage from './pages/TalentSearchPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import './App.css';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute/>}>
      <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route element={<ProtectedRoute/>}>
        <Route path="/dashboard" element={
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        } />
        <Route path="/talent-search" element={
          <TalentLayout>
            <TalentSearchPage />
          </TalentLayout>
        } />
        <Route path="/talent-search/:candidateId" element={
          <TalentLayout>
            <CandidateProfilePage />
          </TalentLayout>
        } />
        </Route>
        {/* Add more routes for other pages here */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
