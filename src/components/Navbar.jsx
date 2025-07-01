import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <Link to="/" className="font-bold text-lg hover:text-blue-300">PolyStudi</Link>
      <Link to="/dashboard" className="hover:text-blue-300">Dashboard</Link>
    </div>
    <div>
      {/* Placeholder for class navigation or user menu */}
    </div>
  </nav>
);

export default Navbar; 