import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ListTodo,
  BrainCircuit,
  Grip,
  CalendarClock,
  Sparkles,
  Bot
} from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('https://my-to-do-listtt.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const { token } = await res.json();
        localStorage.setItem('token', token);
        navigate('/');
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Login failed');
    }
  };

  const features = [
    { icon: BrainCircuit, text: "Smart Task Management", color: "text-purple-400" },
    { icon: Grip, text: "Drag & Drop Organization", color: "text-blue-400" },
    { icon: Bot, text: "Automated Workflow with AI", color: "text-emerald-400" },
    { icon: CalendarClock, text: "Priority & Due Date Tracking", color: "text-orange-400" },
    { icon: Sparkles, text: "Beautiful & Responsive Interface", color: "text-pink-400" }
  ];

  return (
    // THAY ĐỔI: Thêm bg-gradient cho container cha để Mobile cũng có nền đẹp
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">

      <div className="hidden md:flex w-1/2 flex-col justify-center items-center text-white p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"></div>

        <div className="z-10 flex flex-col items-center text-center space-y-6 max-w-lg">
          <div className="flex flex-col items-center">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20 shadow-xl mb-3">
              <ListTodo size={48} className="text-cyan-400" />
            </div>
            <h1 className="text-4xl font-black tracking-tight drop-shadow-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              My Todo App
            </h1>
            <p className="text-blue-200 mt-1 text-base font-medium">
              Join us and start organizing your life today.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 w-full shadow-lg">
            <h3 className="text-lg font-bold mb-3 text-left border-b border-white/10 pb-2">Main Features</h3>
            <ul className="space-y-3 text-left">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center space-x-3 text-blue-100 group">
                  <div className={`p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition border border-white/5 ${feature.color}`}>
                    <feature.icon size={18} />
                  </div>
                  <span className="font-medium text-sm">{feature.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 opacity-80">
            <p className="text-xs font-light tracking-wider uppercase text-slate-400">Developed by</p>
            <p className="text-base font-bold text-white mt-0.5">Lê Nghĩa Hiệp</p>
          </div>
        </div>
      </div>

      {/* Nửa bên phải: Form Login */}
      {/* THAY ĐỔI: Trên mobile background trong suốt để lộ gradient cha, trên desktop mới dùng bg-[#f8fafc] */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-6 md:bg-[#f8fafc] relative">

        {/* Họa tiết nền chỉ hiện trên Desktop */}
        <div className="hidden md:block absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>

        <form
          onSubmit={handleSubmit}
          className="relative bg-white/90 md:bg-white/80 border border-white shadow-2xl rounded-3xl p-6 md:p-8 w-full max-w-md transition-all duration-300 backdrop-blur-xl"
        >
          <div className="text-center mb-6">
            <div className="inline-block p-2 rounded-full bg-blue-50 text-blue-600 mb-2">
              <ListTodo size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
            <p className="text-slate-500 mt-1 text-sm">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm py-2 px-4 rounded-xl mb-4 border border-red-100 font-medium text-center flex items-center justify-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Username</label>
              <input
                type="text"
                autoFocus
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white text-slate-800 placeholder-slate-400 font-medium outline-none transition-all shadow-sm text-sm"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                autoComplete="current-password"
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white text-slate-800 placeholder-slate-400 font-medium outline-none transition-all shadow-sm text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 text-sm"
          >
            Sign In
          </button>

          <div className="text-center mt-6 pt-4 border-t border-slate-100">
            <span className="text-slate-500 text-sm">Don't have an account? </span>
            <a
              className="text-blue-600 font-bold hover:text-blue-700 cursor-pointer transition-colors text-sm hover:underline"
              href="/register"
              onClick={e => {
                e.preventDefault();
                navigate('/register');
              }}
            >
              Sign up for free
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}