import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f6ff] px-4 relative overflow-hidden">
      {/* Animated gradient shapes like your home page */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-[#9102C0]/40 via-[#f3e8ff]/60 to-[#342F76]/30 rounded-full blur-3xl z-0 animate-pulse-slow" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-tr from-[#342F76]/30 via-[#9102C0]/20 to-[#f3e8ff]/40 rounded-full blur-2xl z-0 animate-pulse-slow" />
      
      <div className="text-center max-w-2xl mx-auto relative z-10">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9102C0] to-[#342F76] leading-none drop-shadow-lg">
            404
          </h1>
        </div>
        
        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#342F76] mb-4 font-baumans">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-[#342F76] mb-6 font-poppins">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-[#9102C0] font-baumans italic">
            Don't worry, you can always go back to the homepage and find what you need.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="px-8 py-3 bg-[#9102C0] text-white font-bold rounded-full hover:bg-[#342F76] transition-all duration-200 border-2 border-[#9102C0] shadow-lg hover:scale-105"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 border-2 border-[#9102C0] text-[#9102C0] font-bold rounded-full hover:bg-[#9102C0] hover:text-white transition-all duration-200 hover:scale-105"
          >
            Go Back
          </button>
        </div>
        
        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center space-x-4">
          <div className="w-3 h-3 bg-[#9102C0] rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-[#342F76] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-[#9102C0] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 