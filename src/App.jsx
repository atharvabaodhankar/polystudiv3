import React, { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import ClassPage from './pages/ClassPage';
import SolvedPapers from './pages/SolvedPapers';
import Notes from './pages/Notes';
import Assignments from './pages/Assignments';
import ExtraMaterials from './pages/ExtraMaterials';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminSignup from './pages/AdminSignup';
import MaterialRequest from './pages/MaterialRequest';
import MaterialDeletion from './pages/MaterialDeletion';
import NotFound from './pages/NotFound';

const App = () => {
  const navLogoRef = useRef();
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar ref={navLogoRef} />
        <main className="flex-1 pt-20 .bg-\[\#9102C0\]">
          <Routes>
            <Route path="/" element={<Home navLogoRef={navLogoRef} />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin-signup" element={<AdminSignup />} />
            <Route path="/delete-materials" element={<MaterialDeletion />} />
            <Route path="/class/:classCode" element={<ClassPage />} />
            <Route path="/class/:classCode/solved" element={<SolvedPapers />} />
            <Route path="/class/:classCode/notes" element={<Notes />} />
            <Route path="/class/:classCode/assignments" element={<Assignments />} />
            <Route path="/class/:classCode/extra" element={<ExtraMaterials />} />
            <Route path="/class/:classCode/request-material" element={<MaterialRequest />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Chatbot />
        <Footer />
      </div>
    </Router>
  );
};

export default App;
