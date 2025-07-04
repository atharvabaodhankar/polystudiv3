import React from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaGithub, FaInstagram } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const contactInfo = [
  {
    icon: <FaMapMarkerAlt className="text-[#9102C0] w-6 h-6 bg-white rounded-full p-1" />,
    label: 'Solapur',
    href: 'https://goo.gl/maps/xyz',
  },
  {
    icon: <FaPhoneAlt className="text-[#9102C0] w-6 h-6 bg-white rounded-full p-1" />,
    label: '+91 9373924727',
    href: 'tel:+919373924727',
  },
  {
    icon: <FaEnvelope className="text-[#9102C0] w-6 h-6 bg-white rounded-full p-1" />,
    label: 'baodhankaratharva@gmail.com',
    href: 'mailto:baodhankaratharva@gmail.com',
  },
];

const socialLinks = [
  {
    icon: <FaGithub className="w-5 h-5" />,
    href: 'https://github.com/atharvabaodhankar',
    label: 'GitHub',
    bg: 'bg-white',
    color: 'text-[#9102C0]',
  },
  {
    icon: <FaInstagram className="w-5 h-5" />,
    href: 'https://www.instagram.com/op_athu_/',
    label: 'Instagram',
    bg: 'bg-white',
    color: 'text-[#9102C0]',
  },
  {
    icon: <FaEnvelope className="w-5 h-5" />,
    href: 'mailto:baodhankaratharva@gmail.com',
    label: 'Email',
    bg: 'bg-white',
    color: 'text-[#9102C0]',
  },
];

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleContactClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const el = document.getElementById('contact');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/', { state: { scrollTo: 'contact' } });
    }
  };

  return (
    <footer className="w-full bg-[#9102C0] pt-16 pb-0 mt-16 text-white font-poppins">
      <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row md:items-center justify-between items-start gap-12 md:gap-0">
        {/* Logo and About */}
        <div className="flex-1 flex flex-col items-start">
          <div className="flex items-center gap-4 mb-4">
            <img src="/polystudiv3-round.png" alt="PolyStudi Logo" className="w-16 h-16" />
            <span className="sora-font text-4xl text-white tracking-wide">PolyStudi</span>
          </div>
          <p className="text-white/90 text-lg max-w-md mb-6">
            Whether you're stuck on a tricky problem, need a morale boost, or want to chat about the latest Poly news, we're here for you. Reach out—let's connect and grow together!
          </p>
          <a href="/#contact" onClick={handleContactClick} className="inline-block mt-2 px-7 py-3 rounded-full border-2 border-white text-white hover:bg-white hover:text-[#9102C0] font-semibold transition-all duration-150">Contact Us</a>
        </div>
        {/* Simple, Unified Get In Touch Section */}
        <div className="flex-1 flex flex-col items-start md:items-end text-left md:text-right md:justify-center mt-10 md:mt-0 w-full">
          <h2 className="font-baumans text-2xl text-white mb-4">Get In Touch!</h2>
          <div className="flex flex-col gap-4 mb-4 w-full md:items-end md:text-right items-center text-center">
            {contactInfo.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                className="flex items-center gap-3 px-6 py-3 rounded-lg text-white font-semibold hover:underline transition-all justify-center md:justify-end w-full max-w-xs bg-white/10 hover:bg-white/20 shadow-sm"
                style={{ minWidth: '220px' }}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full border-t border-white/20 mt-12 pt-6 bg-[#342F76] pb-6">
        <p className="text-center text-white text-base font-poppins">
          © 2025 <span className="font-baumans text-white">PolyStudi</span>, inc. All Rights Reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer; 