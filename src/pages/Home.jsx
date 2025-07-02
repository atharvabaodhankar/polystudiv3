import React from 'react';
import navLogo from '../assets/react.svg'; // Replace with actual logo path if available

const Home = () => {
  return (
    <>
      {/* Loader (optional, can be implemented later if needed) */}
      {/* Hero Section */}
      <section id="hero" className="h-screen bg-cover bg-center pt-32 relative z-20" style={{ backgroundImage: "url('/images/hero.jpg')" }}>
        <div id="hero-div" className="flex items-center justify-center h-full">
          <div className="hero-div-main flex flex-col items-center text-center">
            <h1 className="hero-h1 text-[5vw] text-[#9102C0] font-baumans">PolyStudi</h1>
            <div className="hero-div-inner flex items-center gap-4 my-4">
              <h3 className="hero-h3-1 text-2xl font-bold">For Students</h3>
              <span className="w-8 h-1 bg-[#342F76]"></span>
              <h3 className="hero-h3-1 text-2xl font-bold">By Students</h3>
            </div>
            <p className="max-w-xl text-lg mt-4">
              Polystudi is more than just a website, it's a movement. We're passionate about empowering polytechnic students to achieve their academic dreams. So, what are you waiting for? Join the Polystudi fam, crank up your learning curve, and watch your potential explode!
            </p>
          </div>
        </div>
      </section>
      {/* Courses Section */}
      <section id="courses" className="py-20">
        <div className="courses-head section-head flex flex-col items-start justify-center pr-8 gap-10 w-[calc(100%-10vw)] ml-[10vw] mb-20">
          <h1 className="p-h1 text-[5vmax] text-[#9102C0]">Courses</h1>
          <p className="p-p text-[#666] text-lg">
            Select your Course and semester for futher guidance and study materials for that specific Course and Semester.
          </p>
        </div>
        <div className="courses-main flex justify-center">
          <div className="course-box bg-white rounded-lg shadow-lg p-8">
            <ul>
              <h1 className="text-2xl font-bold mb-4">Computer Technology</h1>
              <li><a href="/class/CM1K" className="btn-cm block py-2 px-6 bg-[#342F76] text-white rounded-lg mb-2 transition hover:bg-[#9102C0]">CM 1 K</a></li>
              <li><a href="/class/CM2K" className="btn-cm block py-2 px-6 bg-[#342F76] text-white rounded-lg mb-2 transition hover:bg-[#9102C0]">CM 2 K</a></li>
              <li><a href="/class/CM3K" className="btn-cm block py-2 px-6 bg-[#342F76] text-white rounded-lg mb-2 transition hover:bg-[#9102C0]">CM 3 K</a></li>
              <li><a href="/class/CM4K" className="btn-cm block py-2 px-6 bg-[#342F76] text-white rounded-lg mb-2 transition hover:bg-[#9102C0]">CM 4 K</a></li>
            </ul>
          </div>
        </div>
      </section>
      {/* About Us Section */}
      <section id="aboutus" className="py-20">
        <div className="aboutus-head section-head flex flex-col items-start justify-center pr-8 gap-10 w-[calc(100%-10vw)] ml-[10vw] mb-20">
          <h1 className="p-h1 text-[5vmax] text-[#9102C0]">About Us</h1>
          <p className="p-p text-[#666] text-lg">
            We are just students like you, Here is introduction to us!
          </p>
        </div>
        <div className="aboutus-main flex justify-center">
          <div className="aboutus-box flex justify-center">
            <div className="about-card bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
              <div className="a-c-picture mb-4">
                <img className="img-fluid w-32 h-32 rounded-full object-cover" src="/images/atharva.jpg" alt="Atharva Baodhankar" />
              </div>
              <div className="about-card-content text-center">
                <h3 className="text-2xl font-bold leading-tight">Atharva <br />Baodhankar</h3>
                <h4 className="text-lg text-[#9102C0] mt-2">Developer/Owner</h4>
              </div>
              <ul className="social flex gap-4 mt-4">
                <li>
                  <a href="https://github.com/atharvabaodhankar" className="fa-brands fa-github text-2xl" aria-label="GitHub"></a>
                </li>
                <li>
                  <a href="https://www.instagram.com/op_athu_/" className="fa-brands fa-instagram text-2xl" aria-label="Instagram"></a>
                </li>
                <li>
                  <a href="mailto:baodhankaratharva@gmail.com" className="fa-solid fa-envelope text-2xl" aria-label="Email"></a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* Contact Us Section */}
      <section id="contact" className="py-20">
        <div className="contact-head section-head flex flex-col items-start justify-center pr-8 gap-10 w-[calc(100%-10vw)] ml-[10vw] mb-20">
          <h1 className="p-h1 text-[5vmax] text-[#9102C0]">Contact Us</h1>
          <p className="p-p text-[#666] text-lg">
            Remember, no question is too big or too small. We're here to support you on your Poly journey, so don't be shy - reach out and let's chat!
          </p>
        </div>
        <div className="contact-main flex justify-center">
          <form className="contact-form bg-white rounded-lg shadow-lg p-8 flex flex-col gap-4 w-full max-w-md">
            <input required className="form_contril border border-gray-300 rounded px-4 py-2" placeholder="Name" type="text" name="name" />
            <input required className="form_contril border border-gray-300 rounded px-4 py-2" placeholder="Roll Number" type="text" name="rollno" />
            <input required className="form_contril border border-gray-300 rounded px-4 py-2" placeholder="Email" type="email" name="email" />
            <textarea required className="textarea border border-gray-300 rounded px-4 py-2" placeholder="Message" name="message" rows={4}></textarea>
            <input type="submit" value="Submit" className="send_btn bg-[#9102C0] text-white rounded py-2 px-4 cursor-pointer hover:bg-[#342F76] transition" />
          </form>
        </div>
      </section>
    </>
  );
};

export default Home; 