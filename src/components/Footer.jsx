import React from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaGithub, FaInstagram } from 'react-icons/fa';

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
    color: 'text-[#342F76]',
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
  return (
    <footer className="w-full bg-[#9102C0] pt-16 pb-0 mt-16 text-white font-poppins">
      <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row md:items-center justify-between items-start gap-12 md:gap-0">
        {/* Logo and About */}
        <div className="flex-1 flex flex-col items-start">
          <div className="flex items-center gap-4 mb-4">
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white text-[#9102C0] text-4xl font-baumans shadow">P</span>
            <span className="font-baumans text-4xl text-white tracking-wide">PolyStudi</span>
          </div>
          <p className="text-white/90 text-lg max-w-md mb-6">
            Whether you're stuck on a tricky problem, need a morale boost, or want to chat about the latest Poly news, we're here for you. Reach out—let's connect and grow together!
          </p>
          <a href="https://polystudi.com/#contact" className="inline-block mt-2 px-7 py-3 rounded-full border-2 border-white text-white hover:bg-white hover:text-[#9102C0] font-semibold transition-all duration-150">Contact Us</a>
        </div>
        {/* Simple, Unified Get In Touch Section */}
        <div className="flex-1 flex flex-col items-start md:items-end text-left md:text-right md:justify-center mt-10 md:mt-0 w-full">
          <h2 className="font-baumans text-2xl text-white mb-4">Get In Touch!</h2>
          <div className="flex flex-col gap-4 mb-4">
            {contactInfo.map((item, idx) => (
              <a key={idx} href={item.href} className="flex items-center gap-3 px-0 py-2 rounded-lg text-white font-semibold hover:underline transition-all">
                {item.icon}
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex gap-3 justify-center md:justify-end mt-2">
            {socialLinks.map((item, idx) => (
              <a key={idx} href={item.href} className={`w-10 h-10 flex items-center justify-center rounded-full ${item.bg} ${item.color} hover:bg-[#9102C0] hover:text-white transition-all border border-[#ede9fe]`} aria-label={item.label}>
                {item.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full border-t border-white/20 mt-12 pt-6 bg-[#342F76]">
        <p className="text-center text-white text-base font-poppins">
          © 2025 <span className="font-baumans text-white">PolyStudi</span>, inc. All Rights Reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer; 