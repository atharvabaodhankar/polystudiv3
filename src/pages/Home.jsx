import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import heroImg from '../assets/hero.jpg';
import atharvaImg from '../assets/Atharva.jpg';

const Home = () => {
  const location = useLocation();

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

  return (
    <>
      {/* Loader (optional, can be implemented later if needed) */}
      {/* Hero Section */}
      <section id="hero" className="h-screen bg-cover bg-center pt-32 relative z-20" style={{ backgroundImage: `url(${heroImg})` }}>
        <div id="hero-div" className="flex items-center justify-center h-full">
          <div className="hero-div-main flex flex-col items-center text-center">
            <h1 className="hero-h1 text-[5vw] text-[#9102C0] font-baumans hover:text-[#342F76] transition-colors">PolyStudi</h1>
            <div className="hero-div-inner flex items-center gap-4 my-4">
              <h3 className="hero-h3-1 text-2xl font-bold">For Students</h3>
              <span className="w-8 h-1 bg-[#342F76]"></span>
              <h3 className="hero-h3-1 text-2xl font-bold">By Students</h3>
            </div>
            <p className="max-w-xl text-lg mt-4 font-poppins">
              Polystudi is more than just a website, it's a movement. We're passionate about empowering polytechnic students to achieve their academic dreams. So, what are you waiting for? Join the Polystudi fam, crank up your learning curve, and watch your potential explode!
            </p>
          </div>
        </div>
      </section>
      {/* Courses Section */}
      <section id="courses" className="py-20">
        <div className="courses-head section-head flex flex-col items-start justify-center pr-8 gap-10 w-[calc(100%-10vw)] ml-[10vw] mb-20">
          <h1 className="p-h1 text-[5vmax] text-[#9102C0] font-baumans">Courses</h1>
          <p className="p-p text-[#666] text-lg font-poppins">
            Select your Course and semester for futher guidance and study materials for that specific Course and Semester.
          </p>
        </div>
        <div className="courses-main flex justify-center">
          <div className="course-box bg-white rounded-lg shadow-lg p-8">
            <ul className="flex flex-col items-center gap-12">
              <h1 className="text-3xl font-bold mb-4 font-baumans">Computer Technology</h1>
              <li><a href="/class/CM1K" className="btn-cm px-16 py-6 border-2 border-[#9102C0] rounded-[10px] font-bold text-2xl text-black shadow-[0_1px_15px_-4px_rgba(31,0,45,0.75)] relative overflow-hidden transition-all duration-300 hover:text-white before:content-[''] before:absolute before:right-0 before:top-0 before:w-0 before:h-1/2 before:bg-[#9102C0] before:rounded-t-[7px] before:transition-all before:duration-300 hover:before:w-full after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-1/2 after:bg-[#9102C0] after:rounded-b-[7px] after:transition-all after:duration-300 hover:after:w-full">CM 1 K</a></li>
              <li><a href="/class/CM2K" className="btn-cm px-16 py-6 border-2 border-[#9102C0] rounded-[10px] font-bold text-2xl text-black shadow-[0_1px_15px_-4px_rgba(31,0,45,0.75)] relative overflow-hidden transition-all duration-300 hover:text-white before:content-[''] before:absolute before:right-0 before:top-0 before:w-0 before:h-1/2 before:bg-[#9102C0] before:rounded-t-[7px] before:transition-all before:duration-300 hover:before:w-full after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-1/2 after:bg-[#9102C0] after:rounded-b-[7px] after:transition-all after:duration-300 hover:after:w-full">CM 2 K</a></li>
              <li><a href="/class/CM3K" className="btn-cm px-16 py-6 border-2 border-[#9102C0] rounded-[10px] font-bold text-2xl text-black shadow-[0_1px_15px_-4px_rgba(31,0,45,0.75)] relative overflow-hidden transition-all duration-300 hover:text-white before:content-[''] before:absolute before:right-0 before:top-0 before:w-0 before:h-1/2 before:bg-[#9102C0] before:rounded-t-[7px] before:transition-all before:duration-300 hover:before:w-full after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-1/2 after:bg-[#9102C0] after:rounded-b-[7px] after:transition-all after:duration-300 hover:after:w-full">CM 3 K</a></li>
              <li><a href="/class/CM4K" className="btn-cm px-16 py-6 border-2 border-[#9102C0] rounded-[10px] font-bold text-2xl text-black shadow-[0_1px_15px_-4px_rgba(31,0,45,0.75)] relative overflow-hidden transition-all duration-300 hover:text-white before:content-[''] before:absolute before:right-0 before:top-0 before:w-0 before:h-1/2 before:bg-[#9102C0] before:rounded-t-[7px] before:transition-all before:duration-300 hover:before:w-full after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-1/2 after:bg-[#9102C0] after:rounded-b-[7px] after:transition-all after:duration-300 hover:after:w-full">CM 4 K</a></li>
            </ul>
          </div>
        </div>
      </section>
      {/* About Us Section */}
      <section id="aboutus" className="py-20">
        <div className="aboutus-head section-head flex flex-col items-start justify-center pr-8 gap-10 w-[calc(100%-10vw)] ml-[10vw] mb-20">
          <h1 className="p-h1 text-[5vmax] text-[#9102C0] font-baumans">About Us</h1>
          <p className="p-p text-[#666] text-lg font-poppins">
            We are just students like you, Here is introduction to us!
          </p>
        </div>
        <div className="aboutus-main flex justify-center">
          <div className="aboutus-box flex justify-center">
            <div className="about-card bg-white rounded-[10px] shadow-lg p-0 text-center overflow-hidden relative w-[300px] m-8 cursor-pointer group">
              <div className="a-c-picture inline-block h-[130px] w-[130px] mb-[50px] z-10 relative">
                <img className="img-fluid w-full h-auto rounded-full object-cover transition-transform duration-700 group-hover:scale-75 group-hover:shadow-[0_0_0_14px_#f7f5ec]" src={atharvaImg} alt="Atharva Baodhankar" />
                <div className="absolute top-0 left-0 w-full h-full rounded-full bg-[#342F76] opacity-90 scale-0 group-hover:scale-100 transition-all duration-300 z-0"></div>
              </div>
              <div className="about-card-content text-center">
                <h3 className="text-2xl font-bold leading-tight font-baumans">Atharva <br />Baodhankar</h3>
                <h4 className="text-lg text-[#9102C0] mt-2 font-poppins">Developer/Owner</h4>
              </div>
              <ul className="social w-full p-0 m-0 bg-[#9102C0] absolute bottom-[-100px] left-0 transition-all duration-500 group-hover:bottom-0 flex justify-center">
                <li className="inline-block"><a href="https://github.com/atharvabaodhankar" className="block p-2 text-[30px] text-white transition-all duration-300 hover:text-[#342F76] mx-4" aria-label="GitHub"><i className="fa-brands fa-github"></i></a></li>
                <li className="inline-block"><a href="https://www.instagram.com/op_athu_/" className="block p-2 text-[30px] text-white transition-all duration-300 hover:text-[#342F76] mx-4" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a></li>
                <li className="inline-block"><a href="mailto:baodhankaratharva@gmail.com" className="block p-2 text-[30px] text-white transition-all duration-300 hover:text-[#342F76] mx-4" aria-label="Email"><i className="fa-solid fa-envelope"></i></a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* Contact Us Section */}
      <section id="contact" className="py-20">
        <div className="contact-head section-head flex flex-col items-start justify-center pr-8 gap-10 w-[calc(100%-10vw)] ml-[10vw] mb-20">
          <h1 className="p-h1 text-[5vmax] text-[#9102C0] font-baumans">Contact Us</h1>
          <p className="p-p text-[#666] text-lg font-poppins">
            Remember, no question is too big or too small. We're here to support you on your Poly journey, so don't be shy - reach out and let's chat!
          </p>
        </div>
        <div className="contact-main flex justify-center">
          <form className="contact-form bg-white rounded-lg shadow-lg p-8 flex flex-col gap-4 w-full max-w-md">
            <input required className="form_contril border border-gray-300 rounded px-4 py-2 font-poppins" placeholder="Name" type="text" name="name" />
            <input required className="form_contril border border-gray-300 rounded px-4 py-2 font-poppins" placeholder="Roll Number" type="text" name="rollno" />
            <input required className="form_contril border border-gray-300 rounded px-4 py-2 font-poppins" placeholder="Email" type="email" name="email" />
            <textarea required className="textarea border border-gray-300 rounded px-4 py-2 font-poppins" placeholder="Message" name="message" rows={4}></textarea>
            <input type="submit" value="Submit" className="send_btn bg-[#9102C0] text-white rounded py-2 px-4 cursor-pointer hover:bg-[#342F76] transition font-poppins" />
          </form>
        </div>
      </section>
    </>
  );
};

export default Home; 