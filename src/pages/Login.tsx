import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/');
    } else {
      toast.error('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-silver/5 blur-[120px] rounded-full" />

      <div className="w-full max-w-md luxury-card p-8 bg-matte/80 backdrop-blur-xl border-gold/20">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 p-1 gold-gradient rounded-full">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-gold">LOL</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold gold-text mb-2">LOL Station System</h1>
          <p className="text-muted-foreground">نظام إدارة محطة لول فيب</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-silver/80 block">اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-luxury"
              placeholder="Username"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-silver/80 block">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-luxury"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="w-full btn-primary mt-4">
            <LogIn className="w-5 h-5 ml-2" />
            تسجيل الدخول
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;