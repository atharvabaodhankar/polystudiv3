import React from 'react';
import navLogo from '../assets/nav-logo.png';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminDropdown, setAdminDropdown] = useState(false);
  // Extract classCode from the URL if present
  const match = location.pathname.match(/^\/class\/([^\/]+)/);
  const classCode = match ? match[1] : null;
  const homeLink = classCode ? `/class/${classCode}` : '/';

  // Helper to navigate to home and scroll to section
  const handleNavSection = (sectionId) => (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      // Already on home, just scroll
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Go to home, then scroll after navigation
      navigate('/', { state: { scrollTo: sectionId } });
    }
  };

  return (
    <div id="navbar" className="w-full h-20 flex items-center justify-between px-[3.5vw] border-b border-white/20 fixed top-0 left-0 bg-white z-[100] transition-all duration-1000">
      <div className="nav-logo flex items-center gap-8">
        <Link to="/" className="flex items-center gap-8">
          <img src={navLogo} alt="PolyStudi Logo" className="w-[55px] border border-[#342F76] rounded-full" />
          <span className="font-baumans text-[2rem] text-black">PolyStudi</span>
        </Link>
      </div>
      <nav id="nav">
        <ul className="flex gap-[2vw]">
          <li>
            <Link to={homeLink} className="nav-btn uppercase bg-white/10 border border-black/10 rounded-xl py-2 px-4 relative transition-all text-xl text-black">Home</Link>
          </li>
          <li><a href="#courses" onClick={handleNavSection('courses')} className="nav-btn uppercase bg-white/10 border border-black/10 rounded-xl py-2 px-4 relative transition-all text-xl text-black">Courses</a></li>
          <li><a href="#aboutus" onClick={handleNavSection('aboutus')} className="nav-btn uppercase bg-white/10 border border-black/10 rounded-xl py-2 px-4 relative transition-all text-xl text-black">AboutUs</a></li>
          <li><a href="#contact" onClick={handleNavSection('contact')} className="nav-btn uppercase bg-white/10 border border-black/10 rounded-xl py-2 px-4 relative transition-all text-xl text-black">ContactUs</a></li>
          <li className="relative">
            <button
              className="nav-btn uppercase bg-white/10 border border-black/10 rounded-xl py-2 px-4 relative transition-all text-xl text-black flex items-center gap-2"
              onClick={() => setAdminDropdown((v) => !v)}
              type="button"
            >
              Admins
              <svg className={`w-4 h-4 ml-1 transition-transform ${adminDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {adminDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-[#ede9fe] rounded-xl shadow-lg z-50 flex flex-col">
                <Link to="/login" onClick={() => setAdminDropdown(false)} className="px-5 py-3 text-[#9102C0] font-semibold hover:bg-[#f3e8ff] rounded-t-xl transition">Admin Login</Link>
                <Link to="/admin-signup" onClick={() => setAdminDropdown(false)} className="px-5 py-3 text-[#342F76] font-semibold hover:bg-[#f3e8ff] rounded-b-xl transition">Admin Signup</Link>
              </div>
            )}
          </li>
          {classCode && (
            <li>
              <Link to={`/class/${classCode}/assignments`} className="nav-btn uppercase bg-white/10 border border-black/10 rounded-xl py-2 px-4 relative transition-all text-xl text-black">
                Assignments
              </Link>
            </li>
          )}
        </ul>
        <div className="menu-btn ml-4">
          <span className="block w-8 h-1 bg-black mb-1"></span>
        </div>
      </nav>
    </div>
  );
};

export default Navbar; 