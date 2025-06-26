import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import TalentLayout from './layouts/TalentLayout';
import Dashboard from './pages/Dashboard';
import TalentSearchPage from './pages/TalentSearchPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
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
        {/* Add more routes for other pages here */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
