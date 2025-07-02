import React from 'react';

const SyllabusTable = ({ data }) => (
  <div className="overflow-x-auto rounded-lg shadow">
    <table className="min-w-full bg-white text-left text-sm font-poppins">
      <thead className="bg-[#342F76] text-white">
        <tr>
          <th className="py-3 px-4">Sr.No</th>
          <th className="py-3 px-4">Subject Name</th>
          <th className="py-3 px-4">Subject Code</th>
          <th className="py-3 px-4">Total Marks</th>
          <th className="py-3 px-4">Download PDF</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="border-b hover:bg-[#f3e8ff] transition">
            <td className="py-2 px-4">{row.sr}</td>
            <td className="py-2 px-4">{row.name}</td>
            <td className="py-2 px-4">{row.code}</td>
            <td className="py-2 px-4">{row.marks}</td>
            <td className="py-2 px-4">
              <a href={row.pdf} className="bg-[#9102C0] text-white px-4 py-1 rounded hover:bg-[#342F76] transition font-bold">Download</a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default SyllabusTable; 