import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import heroImg from '../assets/hero.jpg';
import atharvaImg from '../assets/Atharva.jpg';
import { FaGithub, FaInstagram, FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import { supabase } from '../supabaseClient';

const Home = () => {
  const location = useLocation();
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactError, setContactError] = useState('');
  const [showAllCourses, setShowAllCourses] = useState(false);

  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100); // wait for DOM
      }
    }
  }, [location]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactSuccess('');
    setContactError('');
    const form = e.target;
    const name = form.name.value;
    const rollno = form.rollno.value;
    const email = form.email.value;
    const message = form.message.value;
    const { error } = await supabase.from('reviews').insert({ name, rollno, email, message });
    if (error) {
      setContactError('Failed to send message. Please try again.');
    } else {
      setContactSuccess('Message sent successfully!');
      form.reset();
    }
    setContactLoading(false);
  };

  return (
    <>
      {/* Hero Section */}
      <section id="hero" className="h-[90vh] min-h-[500px] bg-cover bg-center relative flex items-center justify-center" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#9102C0]/80 via-[#9102C0]/60 to-[#342F76]/80 z-10" />
        <div className="relative z-20 flex flex-col items-center justify-center text-center w-full px-4">
          <h1 className="text-5xl md:text-7xl sora-font bg-gradient-to-r from-white via-[#f3e8ff] to-[#9102C0] bg-clip-text text-transparent drop-shadow-lg mb-4">PolyStudi</h1>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
            <span className="text-xl md:text-2xl font-bold text-white/90">For Students</span>
            <span className="hidden md:block w-8 h-1 bg-white/60 rounded-full" />
            <span className="text-xl md:text-2xl font-bold text-white/90">By Students</span>
          </div>
          <div className="backdrop-blur-md bg-white/20 rounded-xl shadow-lg p-6 max-w-2xl mx-auto mb-6">
            <p className="text-lg md:text-xl text-white font-poppins">
              Polystudi is more than just a website, it's a movement. We're passionate about empowering polytechnic students to achieve their academic dreams. So, what are you waiting for? Join the Polystudi fam, crank up your learning curve, and watch your potential explode!
            </p>
          </div>
          <a href="#courses" className="inline-block mt-2 px-8 py-3 rounded-full bg-white text-[#9102C0] font-bold text-lg shadow hover:bg-[#9102C0] hover:text-white transition-all duration-200 border-2 border-white">Get Started</a>
        </div>
      </section>
      {/* Courses Section */}
      <section id="courses" className="py-24 bg-[#f8f6ff] relative overflow-hidden">
        {/* Decorative blurred gradient shapes */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-[#9102C0]/20 via-[#f3e8ff]/40 to-[#342F76]/10 rounded-full blur-3xl z-0 animate-pulse-slow" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-tr from-[#342F76]/20 via-[#9102C0]/10 to-[#f3e8ff]/30 rounded-full blur-2xl z-0 animate-pulse-slow" />
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-baumans text-[#9102C0] mb-2 pb-5 font-bold">Courses</h1>
          <p className="text-[#342F76] text-lg mb-2 font-poppins">Select your Course and semester for further guidance and study materials for that specific Course and Semester.</p>
          <p className="text-[#9102C0] text-base mb-10 font-baumans italic">Empowering Polytechnic Students, One Click at a Time.</p>
          {/* Computer Technology (CM) always visible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-8">
            {Array.from({ length: 5 }, (_, i) => ({
              code: `CM${i + 1}K`,
              label: `CM ${i + 1} K`,
              icon: <svg className="w-7 h-7 text-[#9102C0]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>,
            })).map((sem) => (
              <a
                key={sem.code}
                href={`/class/${sem.code}`}
                className="group relative bg-white/80 border border-[#ede9fe] rounded-xl shadow-sm p-6 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-104 hover:border-[#9102C0] focus:outline-none focus:ring-2 focus:ring-[#9102C0]/30"
                style={{ minHeight: 160 }}
              >
                <div className="mb-1">{sem.icon}</div>
                <span className="font-baumans text-lg text-[#9102C0]">{sem.label}</span>
                <span className="mt-1 text-[#342F76] text-xs font-poppins">Semester</span>
                <span className="mt-3 inline-block px-4 py-1 rounded-full bg-[#9102C0] text-white font-bold text-xs shadow-sm transition-all duration-150 hover:bg-[#342F76]">Explore</span>
              </a>
            ))}
          </div>
          {/* Show more courses button */}
          {!showAllCourses && (
            <button
              className="mx-auto block px-7 py-2 rounded-full bg-[#342F76] text-white font-bold text-base shadow-sm hover:bg-[#9102C0] hover:text-white transition-all duration-200 border border-[#9102C0]"
              onClick={() => setShowAllCourses(true)}
            >
              Show More Courses
            </button>
          )}
          {/* EJ classes, shown when showAllCourses is true */}
          {showAllCourses && (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
              {Array.from({ length: 5 }, (_, i) => ({
                code: `EJ${i + 1}K`,
                label: `EJ ${i + 1} K`,
                icon: <svg className="w-7 h-7 text-[#342F76]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" /></svg>,
              })).map((sem) => (
                <a
                  key={sem.code}
                  href={`/class/${sem.code}`}
                  className="group relative bg-white/80 border border-[#ede9fe] rounded-xl shadow-sm p-6 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-104 hover:border-[#342F76] focus:outline-none focus:ring-2 focus:ring-[#342F76]/30"
                  style={{ minHeight: 160 }}
                >
                  <div className="mb-1">{sem.icon}</div>
                  <span className="font-baumans text-lg text-[#342F76]">{sem.label}</span>
                  <span className="mt-1 text-[#9102C0] text-xs font-poppins">Semester</span>
                  <span className="mt-3 inline-block px-4 py-1 rounded-full bg-[#342F76] text-white font-bold text-xs shadow-sm transition-all duration-150 hover:bg-[#9102C0]">Explore</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* About Us Section */}
      <section id="aboutus" className="bg-[#f8f6ff] py-24 relative overflow-x-hidden">
        {/* Decorative blurred gradient shapes */}
        <div className="absolute -left-32 top-24 w-96 h-96 bg-gradient-to-br from-[#9102C0]/10 to-[#342F76]/0 rounded-full blur-3xl z-0" />
        <div className="absolute right-0 top-1/3 w-80 h-80 bg-gradient-to-tr from-[#342F76]/10 via-[#9102C0]/10 to-[#f3e8ff]/20 rounded-full blur-2xl z-0 animate-pulse-slow" />
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-baumans text-[#9102C0] mb-2 pb-2 font-bold text-left">About Us</h1>
          <h2 className="text-xl md:text-2xl font-baumans text-[#342F76] mb-4 font-semibold tracking-wide text-left">Meet the Creator</h2>
          <p className="text-[#9102C0] text-lg mb-10 font-baumans italic max-w-2xl text-left">Bringing websites to life, one pixel at a time. Passionate about modern web design, animation, and empowering students through technology.</p>
          <div className="flex justify-center">
            <div className="relative bg-white/80 backdrop-blur-2xl border-2 border-transparent rounded-3xl shadow-2xl p-10 text-center overflow-hidden w-full max-w-md group transition-all duration-300 hover:shadow-[0_8px_40px_-8px_#9102C0]">
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none z-0 border-2 border-transparent group-hover:border-[#9102C0] group-hover:shadow-[0_0_32px_0_#9102C0] transition-all duration-300" style={{ boxShadow: '0 0 0 4px #f3e8ff44, 0 0 32px 0 #9102C0' }} />
              <div className="relative z-10 flex flex-col items-center">
                <div className="inline-block h-[120px] w-[120px] mb-6 rounded-full border-4 border-[#9102C0]/30 shadow-lg overflow-hidden bg-gradient-to-br from-[#9102C0]/10 to-[#f3e8ff]/30">
                  <img className="w-full h-full object-cover" src={atharvaImg} alt="Atharva Baodhankar" />
                </div>
                <h3 className="text-2xl font-bold leading-tight font-baumans text-[#342F76] mb-1">Atharva Baodhankar</h3>
                <h4 className="text-lg text-[#9102C0] font-poppins mb-2">Web Designer & Developer</h4>
                <p className="text-[#342F76] text-base font-poppins mb-4">I bring sites to life with clean, user-friendly interfaces and captivating animations. Over 50+ websites built. Always learning, always innovating.</p>
                <div className="flex justify-center gap-4 mt-2 mb-6">
                  <a href="https://github.com/atharvabaodhankar" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#f3e8ff] text-[#9102C0] hover:bg-[#9102C0] hover:text-white transition-all" aria-label="GitHub"><FaGithub className="text-2xl" /></a>
                  <a href="https://www.instagram.com/op_athu_/" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#f3e8ff] text-[#9102C0] hover:bg-[#9102C0] hover:text-white transition-all" aria-label="Instagram"><FaInstagram className="text-2xl" /></a>
                  <a href="mailto:baodhankaratharva@gmail.com" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#f3e8ff] text-[#9102C0] hover:bg-[#9102C0] hover:text-white transition-all" aria-label="Email"><FaEnvelope className="text-2xl" /></a>
                </div>
                <a href="https://atharvabaodhankar.github.io/portfolio/" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-[#9102C0] to-[#342F76] text-white font-bold text-lg shadow hover:scale-105 hover:shadow-lg transition-all duration-200 border-2 border-[#9102C0]">View Portfolio</a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Contact Us Section */}
      <section id="contact" className="py-24 bg-[#f8f6ff]">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-baumans text-[#9102C0] mb-4 pb-5 font-bold">Contact Us</h1>
          <p className="text-[#342F76] text-lg mb-10 font-poppins">
            Remember, no question is too big or too small. We're here to support you on your Poly journey, so don't be shy - reach out and let's chat!
          </p>
          <div className="flex justify-center">
            <form className="relative bg-[#fcfaff] border border-[#e0cafd] rounded-xl shadow-sm p-8 flex flex-col gap-6 w-full max-w-md" onSubmit={handleContactSubmit}>
              <div className="relative">
                <input required className="peer w-full border border-[#e0cafd] rounded-lg px-4 pt-6 pb-2 font-poppins bg-transparent text-[#342F76] focus:outline-none focus:border-[#9102C0] focus:ring-1 focus:ring-[#9102C0]/20 transition" placeholder=" " type="text" name="name" id="contact-name" />
                <label htmlFor="contact-name" className="absolute left-4 top-2 text-[#9102C0] text-sm font-semibold pointer-events-none transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#342F76]/60 peer-focus:top-2 peer-focus:text-[#9102C0] peer-focus:text-sm">Name</label>
              </div>
              <div className="relative">
                <input required className="peer w-full border border-[#e0cafd] rounded-lg px-4 pt-6 pb-2 font-poppins bg-transparent text-[#342F76] focus:outline-none focus:border-[#9102C0] focus:ring-1 focus:ring-[#9102C0]/20 transition" placeholder=" " type="text" name="rollno" id="contact-rollno" />
                <label htmlFor="contact-rollno" className="absolute left-4 top-2 text-[#9102C0] text-sm font-semibold pointer-events-none transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#342F76]/60 peer-focus:top-2 peer-focus:text-[#9102C0] peer-focus:text-sm">Roll Number</label>
              </div>
              <div className="relative">
                <input required className="peer w-full border border-[#e0cafd] rounded-lg px-4 pt-6 pb-2 font-poppins bg-transparent text-[#342F76] focus:outline-none focus:border-[#9102C0] focus:ring-1 focus:ring-[#9102C0]/20 transition" placeholder=" " type="email" name="email" id="contact-email" />
                <label htmlFor="contact-email" className="absolute left-4 top-2 text-[#9102C0] text-sm font-semibold pointer-events-none transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#342F76]/60 peer-focus:top-2 peer-focus:text-[#9102C0] peer-focus:text-sm">Email</label>
              </div>
              <div className="relative">
                <textarea required className="peer w-full border border-[#e0cafd] rounded-lg px-4 pt-6 pb-2 font-poppins bg-transparent text-[#342F76] focus:outline-none focus:border-[#9102C0] focus:ring-1 focus:ring-[#9102C0]/20 transition resize-none min-h-[120px]" placeholder=" " name="message" id="contact-message" rows={4}></textarea>
                <label htmlFor="contact-message" className="absolute left-4 top-2 text-[#9102C0] text-sm font-semibold pointer-events-none transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#342F76]/60 peer-focus:top-2 peer-focus:text-[#9102C0] peer-focus:text-sm">Message</label>
              </div>
              <button type="submit" className="w-full py-3 rounded-full bg-[#9102C0] text-white font-bold text-lg shadow-sm hover:scale-105 hover:shadow-md transition-all duration-150" disabled={contactLoading}>
                {contactLoading ? 'Sending...' : 'Send Message'}
              </button>
              {contactSuccess && <div className="text-green-600 text-center font-semibold mt-2">{contactSuccess}</div>}
              {contactError && <div className="text-red-600 text-center font-semibold mt-2">{contactError}</div>}
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home; 