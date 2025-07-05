import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

const Navbar = forwardRef((props, navLogoRef) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminDropdown, setAdminDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const adminDropdownRef = useRef(null);
  // Extract classCode from the URL if present
  const match = location.pathname.match(/^\/class\/([^\/]+)/);
  const classCode = match ? match[1] : null;
  const homeLink = classCode ? `/class/${classCode}` : '/';

  // Helper to navigate to home and scroll to section
  const handleNavSection = (sectionId) => (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      // Already on home, just scroll
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Go to home, then scroll after navigation
      navigate('/', { state: { scrollTo: sectionId } });
    }
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        event.target.closest('.menu-btn') === null
      ) {
        setMobileMenuOpen(false);
      }
      if (
        adminDropdownRef.current &&
        !adminDropdownRef.current.contains(event.target) &&
        event.target.closest('.admin-btn') === null
      ) {
        setAdminDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  const navLinks = (
    <>
      <li>
        <Link to={homeLink} onClick={() => setMobileMenuOpen(false)} className="nav-btn super-hover uppercase bg-white/10 border border-black/10 rounded-xl py-2 px-4 relative transition-all duration-300 text-lg md:text-xl text-black block">Home</Link>
      </li>
      <li>
        <a href="#courses" onClick={handleNavSection('courses')} className="nav-btn super-hover uppercase bg-white/10 border border-black/10 rounded-xl py-2 px-4 relative transition-all duration-300 text-lg md:text-xl text-black block">Courses</a>
      </li>
      <li>
        <a href="#aboutus" onClick={handleNavSection('aboutus')} className="nav-btn super-hover uppercase bg-white/10 border border-black/10 rounded-xl py-2 px-4 relative transition-all duration-300 text-lg md:text-xl text-black block">AboutUs</a>
      </li>
      <li>
        <a href="#contact" onClick={handleNavSection('contact')} className="nav-btn super-hover uppercase bg-white/10 border border-black/10 rounded-xl py-2 px-4 relative transition-all duration-300 text-lg md:text-xl text-black block">ContactUs</a>
      </li>
      <li className="relative" ref={adminDropdownRef}>
        <button
          className="admin-btn nav-btn super-hover uppercase bg-white/10 border border-black/10 rounded-xl py-2 px-4 relative transition-all duration-300 text-lg md:text-xl text-black flex items-center gap-2 w-full justify-between md:justify-center"
          onClick={() => setAdminDropdown((v) => !v)}
          type="button"
          aria-haspopup="true"
          aria-expanded={adminDropdown}
        >
          Admins
          <svg className={`w-4 h-4 ml-1 transition-transform ${adminDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {adminDropdown && (
          <div className="absolute right-0 mt-2 w-44 bg-white border border-[#ede9fe] rounded-xl shadow-lg z-50 flex flex-col animate-fadeIn">
            <Link to="/login" onClick={() => { setAdminDropdown(false); setMobileMenuOpen(false); }} className="px-5 py-3 text-[#9102C0] font-semibold hover:bg-[#f3e8ff] rounded-t-xl transition">Admin Login</Link>
            <Link to="/admin-signup" onClick={() => { setAdminDropdown(false); setMobileMenuOpen(false); }} className="px-5 py-3 text-[#342F76] font-semibold hover:bg-[#f3e8ff] rounded-b-xl transition">Admin Signup</Link>
          </div>
        )}
      </li>
      {classCode && (
        <li>
          <Link to={`/class/${classCode}/assignments`} onClick={() => setMobileMenuOpen(false)} className="nav-btn super-hover uppercase bg-white/10 border border-black/10 rounded-xl py-2 px-4 relative transition-all duration-300 text-lg md:text-xl text-black block">
            Assignments
          </Link>
        </li>
      )}
    </>
  );

  return (
    <header id="navbar" className="w-full h-20 flex items-center justify-between px-[3.5vw] border-b border-white/20 fixed top-0 left-0 bg-white z-[100] transition-all duration-1000">
      <div className="nav-logo flex items-center gap-4 md:gap-8">
        <Link to="/" className="flex items-center gap-4 md:gap-4">
          <img ref={navLogoRef} src="/polystudiv3-round.png" alt="PolyStudi Logo" 
            className="w-15 h-15 relative z-10 bg-white rounded-full p-1" 
            style={{ boxShadow: '0 4px 32px #9102C055' }}
          />
          <span className="sora-font text-[1.5rem] md:text-[1.7rem] text-black">PolyStudi</span>
        </Link>
      </div>
      {/* Desktop Nav */}
      <nav className="hidden lg:block">
        <ul className="flex gap-[2vw] items-center">{navLinks}</ul>
      </nav>
      {/* Mobile Hamburger */}
      <button
        className="menu-btn flex flex-col justify-center items-center w-10 h-10 lg:hidden z-[200] relative"
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileMenuOpen}
        onClick={() => setMobileMenuOpen((v) => !v)}
      >
        <span className={`block w-8 h-1 rounded bg-black transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
        <span className={`block w-8 h-1 rounded bg-black transition-all duration-300 my-1 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-8 h-1 rounded bg-black transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
      </button>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav
          ref={mobileMenuRef}
          className="fixed top-0 left-0 w-full h-screen bg-white/95 z-[150] flex flex-col items-center pt-28 animate-slideDown"
        >
          <ul className="flex flex-col gap-4 w-full max-w-xs mx-auto items-center">{navLinks}</ul>
        </nav>
      )}
    </header>
  );
});

export default Navbar; 