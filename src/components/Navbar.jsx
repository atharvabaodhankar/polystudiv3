import React from 'react';
import navLogo from '../assets/nav-logo.png';

const Navbar = () => {
  return (
    <div id="navbar" className="w-full h-20 flex items-center justify-between px-[3.5vw] border-b border-white/20 fixed top-0 left-0 bg-white z-[100] transition-all duration-1000">
      <div className="nav-logo flex items-center gap-8">
        <a href="#" className="flex items-center gap-8">
          <img src={navLogo} alt="PolyStudi Logo" className="w-[55px] border border-[#342F76] rounded-full" />
          <span className="font-baumans text-[3rem] text-black">PolyStudi</span>
        </a>
      </div>
      <nav id="nav">
        <ul className="flex gap-[2vw]">
          <li><a href="#" className="nav-btn uppercase bg-white/10 border border-black/10 rounded-xl py-2 px-4 relative transition-all text-[2rem] text-black">Home</a></li>
          <li><a href="#courses" className="nav-btn uppercase bg-white/10 border border-black/10 rounded-xl py-2 px-4 relative transition-all text-[2rem] text-black">Courses</a></li>
          <li><a href="#aboutus" className="nav-btn uppercase bg-white/10 border border-black/10 rounded-xl py-2 px-4 relative transition-all text-[2rem] text-black">AboutUs</a></li>
          <li><a href="#contact" className="nav-btn uppercase bg-white/10 border border-black/10 rounded-xl py-2 px-4 relative transition-all text-[2rem] text-black">ContactUs</a></li>
          <li><a href="/admin" className="nav-btn uppercase bg-white/10 border border-black/10 rounded-xl py-2 px-4 relative transition-all text-[2rem] text-black">Admins</a></li>
        </ul>
        <div className="menu-btn ml-4">
          <span className="block w-8 h-1 bg-black mb-1"></span>
        </div>
      </nav>
    </div>
  );
};

export default Navbar; 