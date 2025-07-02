import React from 'react';

const SyllabusTable = ({ data }) => (
  <div className="overflow-x-auto rounded-2xl shadow bg-white border border-[#ede9fe] p-2">
    <table className="min-w-full text-left text-sm font-poppins rounded-2xl overflow-hidden">
      <thead className="bg-[#9102C0] text-white sticky top-0 z-10">
        <tr>
          <th className="py-4 px-6 font-bold text-base rounded-tl-2xl">Sr.No</th>
          <th className="py-4 px-6 font-bold text-base">Subject Name</th>
          <th className="py-4 px-6 font-bold text-base">Subject Code</th>
          <th className="py-4 px-6 font-bold text-base">Total Marks</th>
          <th className="py-4 px-6 font-bold text-base rounded-tr-2xl">Download PDF</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#f3e8ff]/40'} hover:bg-[#f3e8ff]/80 transition`}>
            <td className="py-3 px-6 font-semibold text-[#342F76]">{row.sr}</td>
            <td className="py-3 px-6 font-semibold text-[#342F76]">{row.name}</td>
            <td className="py-3 px-6 text-[#9102C0] font-bold">{row.code}</td>
            <td className="py-3 px-6 text-[#342F76]">{row.marks}</td>
            <td className="py-3 px-6">
              <a href={row.pdf} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#9102C0] text-[#9102C0] hover:bg-[#9102C0] hover:text-white font-semibold transition-all duration-150">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4m-8 8h8" />
                </svg>
                Download
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default SyllabusTable; 