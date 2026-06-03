import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './lib/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Treasury from './pages/Treasury';
import Purchases from './pages/Purchases';
import Expenses from './pages/Expenses';
import Debts from './pages/Debts';
import Reports from './pages/Reports';
import { LayoutDashboard, ShoppingCart, Package, Landmark, ShoppingBag, Receipt, Users, BarChart3, LogOut } from 'lucide-react';

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/" />;
  return <>{children}</>;
};

const Navigation = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/', label: 'الرئيسية', icon: LayoutDashboard, role: 'any' },
    { path: '/pos', label: 'نقاط البيع', icon: ShoppingCart, role: 'any' },
    { path: '/inventory', label: 'المخزن', icon: Package, role: 'admin' },
    { path: '/treasury', label: 'الخزينة', icon: Landmark, role: 'admin' },
    { path: '/purchases', label: 'المشتريات', icon: ShoppingBag, role: 'admin' },
    { path: '/expenses', label: 'المصاريف', icon: Receipt, role: 'admin' },
    { path: '/debts', label: 'الديون', icon: Users, role: 'admin' },
    { path: '/reports', label: 'التقارير', icon: BarChart3, role: 'admin' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-matte border-t border-white/10 flex justify-around p-2 z-50 md:top-0 md:bottom-auto md:flex-col md:w-64 md:h-screen md:justify-start md:gap-4 md:p-6">
      <div className="hidden md:flex flex-col items-center mb-10">
        <div className="w-20 h-20 rounded-full gold-gradient p-1 mb-2">
          <div className="w-full h-full bg-black rounded-full flex items-center justify-center font-bold text-gold text-xl">LOL</div>
        </div>
        <h1 className="text-xl font-bold text-gold">LOL Station</h1>
        <p className="text-xs text-muted-foreground">{user?.name}</p>
      </div>

      {menuItems.map((item) => {
        if (item.role === 'admin' && !isAdmin) return null;
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col md:flex-row items-center gap-1 md:gap-4 p-2 md:px-4 md:py-3 rounded-lg hover:bg-white/5 transition-colors text-xs md:text-base text-muted-foreground hover:text-gold"
          >
            <Icon className="w-6 h-6" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <button 
        onClick={handleLogout}
        className="flex flex-col md:flex-row items-center gap-1 md:gap-4 p-2 md:px-4 md:py-3 rounded-lg hover:bg-destructive/10 transition-colors text-xs md:text-base text-destructive mt-auto"
      >
        <LogOut className="w-6 h-6" />
        <span>خروج</span>
      </button>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="min-h-screen pb-20 md:pb-0 md:pr-64">
                <Navigation />
                <main className="p-4 md:p-8 max-w-7xl mx-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/pos" element={<POS />} />
                    <Route path="/inventory" element={<ProtectedRoute adminOnly><Inventory /></ProtectedRoute>} />
                    <Route path="/treasury" element={<ProtectedRoute adminOnly><Treasury /></ProtectedRoute>} />
                    <Route path="/purchases" element={<ProtectedRoute adminOnly><Purchases /></ProtectedRoute>} />
                    <Route path="/expenses" element={<ProtectedRoute adminOnly><Expenses /></ProtectedRoute>} />
                    <Route path="/debts" element={<ProtectedRoute adminOnly><Debts /></ProtectedRoute>} />
                    <Route path="/reports" element={<ProtectedRoute adminOnly><Reports /></ProtectedRoute>} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;