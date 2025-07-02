import React from 'react';

const Footer = () => {
  return (
    <section id="footer" className="bg-[#9102C0] pt-24 flex flex-col items-center justify-center">
      <div className="footer-box flex w-full px-16 justify-between items-start max-w-6xl">
        <div className="footer-main w-[500px] text-white flex flex-col items-start">
          <h1 className="text-[5rem] font-baumans">PolyStudi</h1>
          <p className="my-8">
            Whether you're stuck on a tricky calculus problem, need a morale boost before your next exam, or just want to chat about the latest Poly news, we're here for you. Don't hesitate to reach out - we love connecting with fellow Poly peeps and helping them navigate the academic jungle.
          </p>
          <a href="https://polystudi.com/#contact" className="cu-btn border-2 border-white text-white py-4 px-6 text-[1.8rem] relative z-10 transition-all hover:text-black inline-block mt-8">Contact Us</a>
        </div>
        <div className="footer-touch w-[300px] text-white text-center">
          <h1 className="text-[5rem] font-baumans">Get In Touch!</h1>
          <p className="my-8">
            Your feedback helps us grow! We welcome your ideas and reviews on how we can improve your experience
          </p>
          <div className="footer-ico mt-16">
            <ul className="flex flex-col items-start gap-8">
              <li className="text-[1.6rem]"><i className="fa-solid fa-location-dot mr-4 text-[2rem]"></i>Solapur</li>
              <li className="text-[1.6rem]"><i className="fa-solid fa-phone mr-4 text-[2rem]"></i>+91 9373924727</li>
              <li className="text-[1.6rem]"><i className="fa-solid fa-envelope mr-4 text-[2rem]"></i>baodhankaratharva@gmail.com</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-rights text-white w-full px-16 py-10 bg-[#342F76] mt-16 overflow-hidden">
        <p className="text-center text-[1.6rem]">
          © 2025 ❤️<a style={{ textDecoration: 'underline' }} href="#" className="ml-2 text-[2rem] font-baumans">PolyStudi</a>, inc. All Rights Reserved
        </p>
      </div>
    </section>
  );
};

export default Footer; 