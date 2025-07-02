import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }
    // Check user role/approval
    const user = data.user;
    if (user) {
      const { data: userRow } = await supabase.from('users').select('role, approved').eq('id', user.id).single();
      if (!userRow || ((userRow.role !== 'admin' && userRow.role !== 'superadmin') || userRow.approved === false)) {
        await supabase.auth.signOut();
        setError('Your admin account is pending approval by the superadmin.');
        setLoading(false);
        return;
      }
    }
    setMessage('Login successful! Redirecting...');
    setLoading(false);
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f6ff] px-4">
      <form onSubmit={handleLogin} className="bg-white border border-[#9102C0] rounded-2xl shadow-xl p-10 flex flex-col gap-6 w-full max-w-md">
        <h1 className="text-3xl font-baumans text-[#9102C0] mb-2 text-center">Admin Login</h1>
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
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
        {message && <div className="text-green-600 text-center font-semibold">{message}</div>}
      </form>
    </div>
  );
};

export default Login; 