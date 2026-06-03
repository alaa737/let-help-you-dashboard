import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { BarChart3, TrendingUp, PieChart, Download, Users } from 'lucide-react';

const Reports = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  const sales = useLiveQuery(() => db.sales.toArray());
  const products = useLiveQuery(() => db.products.toArray());
  const expenses = useLiveQuery(() => db.expenses.toArray());

  const stats = useMemo(() => {
    if (!sales) return null;
    
    const now = new Date();
    const filteredSales = sales.filter(s => {
      const saleDate = new Date(s.date);
      if (period === 'daily') return saleDate.toDateString() === now.toDateString();
      if (period === 'monthly') return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      if (period === 'weekly') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return saleDate >= weekAgo;
      }
      return true;
    });

    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.finalTotal, 0);
    const totalCount = filteredSales.length;

    let estimatedProfit = 0;
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products?.find(p => p.id === item.productId);
        const cost = product?.purchasePrice || 0;
        estimatedProfit += (item.price - cost) * item.quantity;
      });
      estimatedProfit -= sale.discount;
    });

    const filteredExpenses = expenses?.filter(ex => {
      const exDate = new Date(ex.date);
      if (period === 'daily') return exDate.toDateString() === now.toDateString();
      if (period === 'monthly') return exDate.getMonth() === now.getMonth();
      return true;
    }) || [];
    const totalExpenses = filteredExpenses.reduce((sum, ex) => sum + ex.amount, 0);

    return { totalRevenue, totalCount, estimatedProfit, totalExpenses, netProfit: estimatedProfit - totalExpenses };
  }, [sales, products, expenses, period]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gold">التقارير المالية</h1>
          <p className="text-muted-foreground">تحليل المبيعات والأرباح والنمو</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-lg">
          {(['daily', 'weekly', 'monthly'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${period === p ? 'gold-gradient text-black' : 'text-muted-foreground hover:text-white'}`}
            >
              {p === 'daily' ? 'اليوم' : p === 'weekly' ? 'هذا الأسبوع' : 'هذا الشهر'}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="luxury-card p-6 border-gold/20">
          <p className="text-sm text-muted-foreground mb-1">إجمالي المبيعات</p>
          <h2 className="text-3xl font-bold text-gold">{stats?.totalRevenue || 0} ج</h2>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-green-400">
            <TrendingUp className="w-3 h-3" />
            <span>{stats?.totalCount || 0} عملية بيع ناجحة</span>
          </div>
        </div>

        <div className="luxury-card p-6 border-silver/20">
          <p className="text-sm text-muted-foreground mb-1">صافي الربح (تقديري)</p>
          <h2 className="text-3xl font-bold text-silver">{stats?.netProfit || 0} ج</h2>
          <p className="mt-4 text-[10px] text-muted-foreground">بعد خصم المصاريف ({stats?.totalExpenses} ج)</p>
        </div>

        <div className="luxury-card p-6">
          <p className="text-sm text-muted-foreground mb-1">متوسط الفاتورة</p>
          <h2 className="text-3xl font-bold">{(stats?.totalRevenue && stats?.totalCount) ? Math.round(stats.totalRevenue / stats.totalCount) : 0} ج</h2>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-blue-400">
            <Users className="w-3 h-3" />
            <span>أداء ممتاز هذا {period === 'daily' ? 'اليوم' : 'الفترة'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="luxury-card">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-gold" /> المبيعات حسب الموظف</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <span>المدير (admin)</span>
                <span>{sales?.filter(s => s.employeeName === 'المدير').reduce((sum, s) => sum + s.finalTotal, 0)} ج</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full gold-gradient" style={{ width: '100%' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <span>مخلص (mokhles)</span>
                <span>{sales?.filter(s => s.employeeName === 'مخلص').reduce((sum, s) => sum + s.finalTotal, 0)} ج</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full silver-gradient" style={{ width: '40%' }} />
              </div>
            </div>
          </div>
        </section>

        <section className="luxury-card flex items-center justify-center p-12 text-center opacity-50">
          <div>
            <PieChart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm">سيتم إضافة المزيد من الرسوم البيانية المتقدمة في التحديث القادم</p>
            <button className="mt-4 flex items-center gap-2 text-gold text-xs mx-auto border border-gold/20 px-4 py-2 rounded-lg">
              <Download className="w-4 h-4" /> تحميل ملف إكسل
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Reports;