import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const AdminSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    // Sign up with Supabase Auth, passing user_metadata
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          branch,
          year,
        },
      },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    // Insert into users table as admin_candidate with all info
    const user = data.user;
    if (user) {
      await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        branch,
        year,
        role: 'admin_candidate',
        approved: false,
      });
    }
    setMessage('Signup successful! Please verify your email. After verification and superadmin approval, you will be able to log in.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f6ff] px-4">
      <form onSubmit={handleSignup} className="bg-white border border-[#9102C0] rounded-2xl shadow-xl p-10 flex flex-col gap-6 w-full max-w-md">
        <h1 className="text-3xl font-baumans text-[#9102C0] mb-2 text-center">Admin Signup</h1>
        <p className="text-[#342F76] text-center mb-2">Request admin access. You will be able to log in after verifying your email and superadmin approval.</p>
        <input
          type="text"
          required
          className="border border-[#ede9fe] rounded-lg px-4 py-3 font-poppins text-[#342F76] focus:outline-none focus:border-[#9102C0] focus:ring-1 focus:ring-[#9102C0]/20 transition"
          placeholder="Full Name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
        />
        <input
          type="text"
          required
          className="border border-[#ede9fe] rounded-lg px-4 py-3 font-poppins text-[#342F76] focus:outline-none focus:border-[#9102C0] focus:ring-1 focus:ring-[#9102C0]/20 transition"
          placeholder="Branch / Department"
          value={branch}
          onChange={e => setBranch(e.target.value)}
        />
        <input
          type="text"
          required
          className="border border-[#ede9fe] rounded-lg px-4 py-3 font-poppins text-[#342F76] focus:outline-none focus:border-[#9102C0] focus:ring-1 focus:ring-[#9102C0]/20 transition"
          placeholder="Year (or N/A)"
          value={year}
          onChange={e => setYear(e.target.value)}
        />
        <input
          type="email"
          required
          className="border border-[#ede9fe] rounded-lg px-4 py-3 font-poppins text-[#342F76] focus:outline-none focus:border-[#9102C0] focus:ring-1 focus:ring-[#9102C0]/20 transition"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          className="border border-[#ede9fe] rounded-lg px-4 py-3 font-poppins text-[#342F76] focus:outline-none focus:border-[#9102C0] focus:ring-1 focus:ring-[#9102C0]/20 transition"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full py-3 rounded-full bg-[#9102C0] text-white font-bold text-lg shadow-sm hover:scale-105 hover:shadow-md transition-all duration-150"
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Request Admin Access'}
        </button>
        {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
        {message && <div className="text-green-600 text-center font-semibold">{message}</div>}
      </form>
    </div>
  );
};

export default AdminSignup; 