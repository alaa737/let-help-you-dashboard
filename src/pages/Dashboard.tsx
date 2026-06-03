import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, Landmark, ShoppingBag, Receipt, Users, BarChart3, AlertTriangle, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react';

const Dashboard = () => {
  const products = useLiveQuery(() => db.products.toArray());
  const sales = useLiveQuery(() => db.sales.toArray());
  const debts = useLiveQuery(() => db.debts.toArray());
  const treasuryLogs = useLiveQuery(() => db.treasuryLogs.toArray());

  const todaySales = sales?.filter(s => new Date(s.date).toDateString() === new Date().toDateString()) || [];
  const todayTotal = todaySales.reduce((sum, s) => sum + s.finalTotal, 0);
  const totalDebts = debts?.reduce((sum, d) => sum + d.remaining, 0) || 0;
  
  const treasuryBalance = treasuryLogs?.reduce((sum, log) => 
    log.type === 'in' ? sum + log.amount : sum - log.amount, 0) || 0;

  const lowStockItems = products?.filter(p => p.quantity <= p.lowStockLimit) || [];

  const stats = [
    { label: 'مبيعات اليوم', value: `${todayTotal} جنيه`, icon: TrendingUp, color: 'text-gold' },
    { label: 'رصيد الخزينة', value: `${treasuryBalance} جنيه`, icon: Wallet, color: 'text-silver' },
    { label: 'عدد المبيعات', value: todaySales.length, icon: ArrowUpRight, color: 'text-blue-400' },
    { label: 'الديون المعلقة', value: `${totalDebts} جنيه`, icon: Users, color: 'text-destructive' },
  ];

  const quickLinks = [
    { label: 'بيع سريع', path: '/pos', icon: ShoppingCart, color: 'gold-gradient' },
    { label: 'المخزن', path: '/inventory', icon: Package, color: 'silver-gradient' },
    { label: 'الخزينة', path: '/treasury', icon: Landmark, color: 'bg-zinc-800' },
    { label: 'المشتريات', path: '/purchases', icon: ShoppingBag, color: 'bg-zinc-800' },
    { label: 'المصاريف', path: '/expenses', icon: Receipt, color: 'bg-zinc-800' },
    { label: 'الديون', path: '/debts', icon: Users, color: 'bg-zinc-800' },
    { label: 'التقارير', path: '/reports', icon: BarChart3, color: 'bg-zinc-800' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gold">مرحباً بك في LOL Station</h1>
          <p className="text-muted-foreground mt-1">نظرة عامة على أداء المحل اليوم</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="luxury-card p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <h3 className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-white/5`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="w-1 h-6 gold-gradient rounded-full" />
          روابط سريعة
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {quickLinks.map((link, i) => (
            <Link key={i} to={link.path} className={`luxury-card p-4 flex flex-col items-center gap-3 hover:scale-105 transition-transform text-center`}>
              <div className={`p-4 rounded-full ${link.color} text-black`}>
                <link.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alerts */}
        <section className="luxury-card">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              تنبيهات المخزون المنخفض
            </h2>
            <Link to="/inventory" className="text-xs text-gold">عرض الكل</Link>
          </div>
          <div className="p-4 space-y-3">
            {lowStockItems.length > 0 ? (
              lowStockItems.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-destructive font-bold">{p.quantity}</p>
                    <p className="text-[10px] text-muted-foreground">متبقي</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">لا يوجد نواقص حالياً</p>
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="luxury-card">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-bold">أحدث المبيعات</h2>
          </div>
          <div className="p-4 space-y-3">
            {sales?.length ? (
              sales.slice(-5).reverse().map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold">
                      #{sale.id}
                    </div>
                    <div>
                      <p className="font-medium">{sale.items[0].name} {sale.items.length > 1 && `+${sale.items.length - 1}`}</p>
                      <p className="text-xs text-muted-foreground">{new Date(sale.date).toLocaleTimeString('ar-EG')}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-gold font-bold">{sale.finalTotal} ج</p>
                    <p className="text-[10px] text-muted-foreground">{sale.paymentMethod}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">لم يتم تسجيل مبيعات اليوم</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;