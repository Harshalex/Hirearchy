import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import TalentLayout from './layouts/TalentLayout';
import Dashboard from './pages/Dashboard';
import TalentSearchPage from './pages/TalentSearchPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import LoginPage from './pages/LoginPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <TalentLayout>
            <TalentSearchPage />
          </TalentLayout>
        } />
        <Route path=":candidateId" element={
          <TalentLayout>
            <CandidateProfilePage />
          </TalentLayout>
        } />
        {/* Add more routes for other pages here */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
