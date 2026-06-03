import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Landmark, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const Treasury = () => {
  const logs = useLiveQuery(() => db.treasuryLogs.orderBy('date').reverse().toArray());
  
  const balance = logs?.reduce((sum, log) => 
    log.type === 'in' ? sum + log.amount : sum - log.amount, 0) || 0;

  const totalIn = logs?.filter(l => l.type === 'in').reduce((sum, l) => sum + l.amount, 0) || 0;
  const totalOut = logs?.filter(l => l.type === 'out').reduce((sum, l) => sum + l.amount, 0) || 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gold">الخزينة</h1>
        <p className="text-muted-foreground">متابعة حركة السيولة النقدية</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="luxury-card p-8 border-gold/30 bg-gold/5 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Landmark className="w-32 h-32" />
          </div>
          <p className="text-sm text-silver/80 mb-2">الرصيد الحالي</p>
          <h2 className="text-4xl font-bold text-gold">{balance} جنيه</h2>
        </div>

        <div className="luxury-card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">إجمالي الوارد</p>
            <h3 className="text-xl font-bold text-green-400">+{totalIn} ج</h3>
          </div>
          <ArrowUpCircle className="w-10 h-10 text-green-400 opacity-20" />
        </div>

        <div className="luxury-card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">إجمالي المنصرف</p>
            <h3 className="text-xl font-bold text-destructive">-{totalOut} ج</h3>
          </div>
          <ArrowDownCircle className="w-10 h-10 text-destructive opacity-20" />
        </div>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">سجل العمليات</h2>
        <div className="luxury-card overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-white/5 text-silver text-xs">
              <tr>
                <th className="p-4">التاريخ</th>
                <th className="p-4">البيان</th>
                <th className="p-4">النوع</th>
                <th className="p-4">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {logs?.map(log => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-xs text-muted-foreground">
                    {new Date(log.date).toLocaleString('ar-EG')}
                  </td>
                  <td className="p-4 text-sm">{log.reason}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${log.type === 'in' ? 'bg-green-500/20 text-green-400' : 'bg-destructive/20 text-destructive'}`}>
                      {log.type === 'in' ? 'وارد' : 'صادر'}
                    </span>
                  </td>
                  <td className={`p-4 font-bold ${log.type === 'in' ? 'text-green-400' : 'text-destructive'}`}>
                    {log.type === 'in' ? '+' : '-'}{log.amount} ج
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Treasury;