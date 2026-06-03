import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { toast } from 'sonner';
import { Plus, Phone, CheckCircle } from 'lucide-react';

const Debts = () => {
  const debts = useLiveQuery(() => db.debts.toArray());
  const [formData, setFormData] = useState({ customerName: '', phone: '', products: '', total: 0, paid: 0 });

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.debts.add({
        ...formData,
        remaining: formData.total - formData.paid,
        date: new Date()
      });
      toast.success('تم تسجيل الدين بنجاح');
      setFormData({ customerName: '', phone: '', products: '', total: 0, paid: 0 });
    } catch (error) {
      toast.error('خطأ في التسجيل');
    }
  };

  const handlePayment = async (debt: any, amount: number) => {
    if (amount <= 0) return;
    const newPaid = debt.paid + amount;
    const newRemaining = debt.total - newPaid;
    
    await db.debts.update(debt.id, { paid: newPaid, remaining: newRemaining });
    await db.treasuryLogs.add({
      type: 'in',
      amount: amount,
      reason: `تحصيل جزء من دين: ${debt.customerName}`,
      date: new Date()
    });
    toast.success('تم تحصيل المبلغ وتحديث الدين');
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gold">الديون والآجل</h1>
        <p className="text-muted-foreground">متابعة حسابات العملاء والمبالغ المتبقية</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="luxury-card p-6 h-fit">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-gold" /> تسجيل دين جديد
          </h2>
          <form onSubmit={handleAddDebt} className="space-y-4">
            <input placeholder="اسم العميل" className="input-luxury" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} required />
            <input placeholder="رقم الهاتف" className="input-luxury" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            <textarea placeholder="المنتجات" className="input-luxury h-20" value={formData.products} onChange={e => setFormData({...formData, products: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="الإجمالي" className="input-luxury" value={formData.total} onChange={e => setFormData({...formData, total: Number(e.target.value)})} />
              <input type="number" placeholder="المدفوع" className="input-luxury" value={formData.paid} onChange={e => setFormData({...formData, paid: Number(e.target.value)})} />
            </div>
            <button type="submit" className="w-full btn-primary">حفظ</button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {debts?.map(debt => (
            <div key={debt.id} className="luxury-card p-6 flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{debt.customerName}</h3>
                  {debt.remaining === 0 && <CheckCircle className="w-5 h-5 text-green-400" />}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {debt.phone}</span>
                  <span>{new Date(debt.date).toLocaleDateString('ar-EG')}</span>
                </div>
                <p className="text-sm bg-white/5 p-2 rounded">{debt.products}</p>
              </div>
              <div className="flex flex-col items-end gap-3 min-w-[150px]">
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">المتبقي</p>
                  <p className="text-2xl font-bold text-destructive">{debt.remaining} ج</p>
                  <p className="text-[10px] text-muted-foreground">من أصل {debt.total} ج</p>
                </div>
                {debt.remaining > 0 && (
                  <button 
                    onClick={() => {
                      const amount = prompt('أدخل المبلغ المحصل:');
                      if (amount) handlePayment(debt, Number(amount));
                    }}
                    className="w-full py-2 px-4 rounded bg-gold/10 text-gold border border-gold/20 hover:bg-gold hover:text-black transition-colors text-xs font-bold"
                  >
                    تحصيل مبلغ
                  </button>
                )}
              </div>
            </div>
          ))}
          {debts?.length === 0 && <p className="text-center text-muted-foreground py-10 opacity-50">لا يوجد ديون مسجلة</p>}
        </div>
      </div>
    </div>
  );
};

export default Debts;