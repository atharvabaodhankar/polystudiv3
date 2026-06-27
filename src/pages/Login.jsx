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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });
    if (googleError) {
      setError(googleError.message);
      setLoading(false);
    }
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

        <div className="flex items-center my-1">
          <div className="flex-grow border-t border-[#ede9fe]"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-sm font-poppins">or</span>
          <div className="flex-grow border-t border-[#ede9fe]"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-3 px-4 rounded-full border border-gray-300 bg-white text-gray-700 font-semibold font-poppins text-base flex items-center justify-center gap-3 shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:scale-103 transition-all duration-150 cursor-pointer"
          disabled={loading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Sign in with Google
        </button>

        {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
        {message && <div className="text-green-600 text-center font-semibold">{message}</div>}
      </form>
    </div>
  );
};

export default Login; 